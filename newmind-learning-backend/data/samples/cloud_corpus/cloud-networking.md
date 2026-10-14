# Laboratorio de redes cloud

## Escenario

CaféNube ejecuta una interfaz web y procesos en segundo plano en subredes cloud separadas. Este escenario ficticio es educativo, no una guía de despliegue en producción.

## Límites

- La subred pública recibe tráfico HTTPS mediante una pasarela gestionada.
- La subred privada aloja procesos sin acceso entrante directo desde internet.
- Las identidades de servicio reciben solo los permisos necesarios para su carga de trabajo.

## Notas de despliegue

```text
interfaz web -> pasarela gestionada -> subred pública
procesos -> punto de acceso interno -> subred privada
```
