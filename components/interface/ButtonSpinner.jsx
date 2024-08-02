
'use client'
import { Button, Spinner} from 'reactstrap'

export default function ButtonSpinner({ loading, children, ...props }) {
    return (
        <Button {...props}>
        {loading ? (
            <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            />
        ) : (
            children
        )}
        </Button>
    )
    }