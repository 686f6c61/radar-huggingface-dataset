# Travor278/evostudio-hil-runtime

## Resumen

EvoStudio HIL Runtime v0.2.3 es un paquete de instalación reproducible para el entorno de ejecución `policy_hil_continuous` de EvoStudio sobre los hosts de la colección PiPER-X. No es un modelo de inteligencia artificial en sí, sino un conjunto de ruedas (wheels) y un instalador que garantiza un entorno validado y consistente para ejecutar políticas de control robótico de tipo *human-in-the-loop* continuo. Lo desarrolla el usuario Travor278 y se distribuye bajo licencia Apache-2.0.

El repositorio no contiene pesos de modelos, checkpoints, calibraciones ni credenciales; únicamente las dependencias de proyecto con licencia Apache/BSD necesarias para el runtime validado. Las dependencias propietarias de NVIDIA (CUDA) se descargan durante la instalación desde el índice oficial de PyTorch CUDA 12.8, evitando así la redistribución de binarios propietarios. Este enfoque lo convierte en una solución de despliegue limpia y auditable para entornos robóticos que requieren una versión exacta de PyTorch, LeRobot y el SDK de inferencia de EvoStudio.

La relevancia actual radica en la necesidad de entornos de ejecución reproducibles en robótica, donde las versiones exactas de las librerías y las dependencias de sistema determinan el comportamiento de los controladores. Al ofrecer una instalación atómica con verificación SHA256, el paquete facilita la reproducción de experimentos y el despliegue en flotas de robots PiPER-X sin ambigüedad de versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (paquete de runtime, no modelo de IA) |
| Parametros totales | No disponible (no contiene pesos de modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (contiene ruedas Python y scripts de instalación) |

## Arquitectura y entrenamiento

No procede. Este repositorio no contiene un modelo entrenado ni una arquitectura neuronal. Se trata de un paquete de instalación que define un entorno de ejecución concreto para el runtime `policy_hil_continuous` de EvoStudio sobre la plataforma PiPER-X. El entorno validado incluye:

- Ubuntu 22.04 x86_64
- Python 3.12.13
- NVIDIA driver 580.173.02
- PyTorch 2.11.0+cu128
- torchvision 0.26.0+cu128
- LeRobot 0.6.0
- EvoStudio inference SDK 0.7.0b7
- EvoStudio HIL runtime 0.2.3

El instalador (`install.sh`) resuelve las ruedas de CUDA desde el índice oficial de PyTorch CUDA 12.8, garantizando versiones exactas y evitando la redistribución de binarios propietarios. El proceso de instalación es atómico: conserva cualquier instalación anterior como copia de seguridad con marca de tiempo y no modifica la configuración específica del host.

## Capacidades

- Instalación reproducible y auditable de un entorno de ejecución para políticas robóticas HIL (human-in-the-loop) continuas.
- Soporte para la plataforma PiPER-X, una colección de hosts robóticos de EvoStudio.
- Integración con LeRobot 0.6.0 para el desarrollo y despliegue de políticas robóticas.
- Uso del SDK de inferencia de EvoStudio 0.7.0b7 para ejecutar modelos de control.
- Instalación atómica con respaldo automático de la versión anterior.
- No incluye datos sensibles (checkpoints, calibraciones, credenciales) por diseño.

## Casos de uso

- **Despliegue de políticas de control robótico en flotas PiPER-X**: el runtime permite instalar el entorno exacto en cada robot, garantizando que todas las unidades ejecuten la misma versión de dependencias y evitando desviaciones por actualizaciones no controladas.
- **Reproducción de experimentos en investigación**: al fijar las versiones de PyTorch, LeRobot y el SDK, los investigadores pueden reproducir resultados de entrenamiento de políticas HIL en diferentes máquinas sin variabilidad de entorno.
- **Integración en pipelines CI/CD para robótica**: el instalador puede ejecutarse en contenedores o máquinas virtuales para crear imágenes base con el runtime validado, facilitando pruebas automatizadas de políticas de control.
- **Actualización controlada de entornos en producción**: el respaldo temporal de la instalación anterior permite revertir a una versión previa en caso de fallos, minimizando el tiempo de inactividad en sistemas robóticos críticos.
- **Entrenamiento de personal en entornos de simulación**: al instalar el mismo runtime en estaciones de desarrollo y simulación, los ingenieros pueden entrenar y probar políticas HIL en un entorno idéntico al de producción.
- **Auditoría de cumplimiento de licencias**: al no redistribuir componentes propietarios de NVIDIA, el paquete facilita el cumplimiento de licencias en organizaciones que necesitan controlar la distribución de binarios de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de modelos, ya que no es un modelo de IA sino un paquete de instalación.

## Requisitos de hardware

- **VRAM**: no aplicable, el runtime no especifica requisitos de VRAM en la información disponible.
- **GPU**: se requiere una GPU compatible con CUDA 12.8 y driver NVIDIA 580.173.02 o superior. No se especifican modelos concretos.
- **CPU**: no se especifican requisitos de CPU.
- **Sistema operativo**: Ubuntu 22.04 x86_64.
- **Python**: 3.12.13 (el instalador acepta la ruta a un intérprete específico).
- **Opciones de despliegue**: instalación local mediante `install.sh`; puede integrarse en imágenes Docker o entornos virtuales con Python 3.12.
- **Latencia y throughput**: no disponibles; dependen del hardware y de la política HIL que se ejecute.

## Comparativa con modelos similares

No aplica. No se conocen paquetes de runtime equivalentes para otras plataformas robóticas en el ecosistema HuggingFace. El repositorio es un caso específico de despliegue de entorno para EvoStudio y PiPER-X, sin competidores directos en el ámbito de los modelos de IA convencionales.

## Limitaciones y advertencias

- **No es un modelo de IA**: este repositorio no contiene pesos de modelos ni puede realizar inferencia por sí mismo; requiere de un modelo de política entrenado (no incluido) para funcionar.
- **Dependencias propietarias**: aunque el repositorio es Apache-2.0, durante la instalación se descargan componentes de NVIDIA (CUDA) sujetos a sus propios términos de licencia, que deben ser aceptados por el usuario.
- **Entorno fijo**: el runtime está validado únicamente para Ubuntu 22.04 x86_64 y Python 3.12.13; otras combinaciones de sistema operativo o versión de Python pueden no ser compatibles.
- **Sin datos de rendimiento**: no se publican benchmarks ni métricas de rendimiento del runtime o de las políticas que ejecuta.
- **Actualizaciones no automáticas**: el paquete está anclado a una revisión específica (v0.2.3); no se proporciona un mecanismo de actualización continua.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Travor278/evostudio-hil-runtime

No se han encontrado enlaces adicionales (papers, blogs, repos oficiales) en la información proporcionada.
