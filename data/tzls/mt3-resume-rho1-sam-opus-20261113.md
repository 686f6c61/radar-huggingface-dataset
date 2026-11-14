# tzls/mt3-resume-rho1-sam-opus-20261113

## Resumen

El repositorio `tzls/mt3-resume-rho1-sam-opus-20261113` no es un modelo entrenado al uso, sino un paquete de reanudación de experimentos de *mid-training*. Contiene tres ejecuciones comparativas (Rho-1, SAM y OPUS) que parten del mismo modelo base, Qwen3-1.7B-Base, se someten a un entrenamiento intermedio sobre un corpus común de 8.000 millones de tokens y después pasan por un SFT con Tülu-3 antes de evaluarse en 11 benchmarks. El autor publica el estado exacto de cada ejecución para que un tercero pueda retomarlas desde el punto de interrupción en su propio hardware.

El paquete incluye código, entorno reproducible, pesos del modelo base, datos, conjuntos de preguntas de benchmark e imágenes de sandbox para la fase de evaluación. El repositorio ocupa 135,2 GB y contiene alrededor de 13.500 archivos; como Hugging Face limita a 20.000 archivos por repositorio, solo el paquete `opus/` está completo y los paquetes `sam/` y `rho1/` incluyen únicamente los archivos que difieren, que se completan mediante enlaces duros con la herramienta `tools/assemble_packages.py`.

La relevancia es de tipo metodológico y de reproducibilidad: no se distribuye un modelo final listo para inferencia, sino un artefacto de investigación que permite continuar entrenamientos a medio terminar. El estado de avance es desigual: Rho-1 ya completó los 8B tokens de mid-training, SAM va por 4,0B de 8B y OPUS por 2,0B de 8B. La etiqueta `qwen3` indica la familia del modelo base, no que este repositorio contenga un modelo Qwen3 nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es Qwen3-1.7B-Base; el repositorio no documenta la arquitectura interna) |
| Parametros totales | 1,7B (modelo base Qwen3-1.7B-Base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (el modelo base Qwen3-1.7B-Base es Apache-2.0; cada dataset conserva su licencia original; el repositorio se declara solo para reproducción científica) |
| Formato de pesos | safetensors (checkpoints de entrenamiento; no se indica GGUF ni otros formatos de inferencia) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura del modelo, sino el procedimiento de entrenamiento. Se parte de Qwen3-1.7B-Base y se aplica un *mid-training* sobre una muestra de 8.000 millones de tokens de datasets públicos, organizados en tres categorías según el nombre de directorio: `general`, `math` y `code`. Posteriormente se realiza un SFT con datos de Tülu-3 y se evalúa en 11 benchmarks, algunos de ellos ejecutados dentro de un sandbox Docker (Piston) para tareas de código.

Los tres métodos comparados (Rho-1, SAM y OPUS) difieren en la estrategia de selección o muestreo de datos durante el mid-training, aunque el repositorio no detalla el algoritmo de cada uno. El paquete preserva el estado completo de cada ejecución: checkpoints, estado del generador de números aleatorios, partición de datos por *rank* y registros de procedencia. La reanudación exige exactamente 4 GPU del mismo modelo con 80 GB cada una, porque el estado se guardó con esa topología de 4 ranks. El entorno fija Python 3.10.20, PyTorch 2.4.0+cu121, CUDA 12.1 y transformers 4.57.6, con validación estricta de versiones.

## Capacidades

- El repositorio no distribuye un modelo listo para inferencia ni documenta capacidades de generación, razonamiento o código del modelo resultante.
- El objetivo es la reproducción de experimentos de mid-training y SFT, no el uso del modelo como servicio.
- Incluye infraestructura de evaluación con 11 benchmarks, con soporte de sandbox Docker para pruebas de código.
- Incluye herramientas de verificación de integridad (SHA-256 por archivo), comprobación de reanudación y recolección de resultados.
- Soporta reanudación tras interrupciones (cortes de energía, OOM, timeouts de NCCL) desde el último checkpoint.
- Permite ejecutar dos métodos en paralelo con 8 GPU (dos grupos de 4).

## Casos de uso

- Reproducción de experimentos de mid-training: un grupo de investigación descarga el paquete, ejecuta `assemble_packages.py` y `verify_bundle.py`, y retoma SAM u OPUS desde el checkpoint exacto para validar los resultados del autor.
- Estudio comparativo de métodos de selección de datos: los tres paquetes comparten base, corpus y SFT, de modo que las diferencias en los 11 benchmarks son atribuibles al método de mid-training.
- Auditoría de reproducibilidad: los manifiestos SHA-256 y los registros de procedencia permiten verificar que los checkpoints coinciden con los del entrenamiento original.
- Formación práctica en pipelines de entrenamiento distribuido: el paquete documenta requisitos de 4 GPU de 80 GB, configuración de entorno y gestión de checkpoints.
- Evaluación de tareas de código en sandbox: la integración con Piston permite ejecutar benchmarks de programación en un entorno aislado.
- Recuperación de ejecuciones interrumpidas: las herramientas `check_resume.py` y `resume_run.py` sirven como referencia para diseñar sistemas de reanudación robustos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona 11 benchmarks y que parte de las ejecuciones están incompletas, pero no incluye tablas de resultados.

## Requisitos de hardware

- GPU: exactamente 4 GPU del mismo modelo con 80 GB de VRAM cada una (por ejemplo, A100 80GB PCIe). No se admite otro número de tarjetas ni mezclar modelos.
- Con 8 GPU se pueden ejecutar dos métodos en paralelo (dos grupos de 4).
- No cabe en GPU de consumo: el requisito mínimo por tarjeta es de 80 GB.
- Conectividad: el autor indica que la ausencia de NVLink entre tarjetas ralentiza el proceso; con NVLink el SFT se beneficia especialmente.
- Almacenamiento: unos 140 GB para la descarga y unos 100 GB adicionales por cada método en ejecución.
- Entorno: Python 3.10.20, PyTorch 2.4.0+cu121, CUDA 12.1, transformers 4.57.6, driver NVIDIA ≥ 530, Docker con `--privileged` para el sandbox de benchmark.
- Tiempos estimados en 4×A100 80GB PCIe sin NVLink: Rho-1, 2–2,5 días; SAM, 6–7 días; OPUS, 10–11,5 días.
- Opciones de despliegue: no aplica; el paquete es para entrenamiento y evaluación, no para servir el modelo con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de inferencia y no se han publicado comparativas con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para uso: es un paquete de reanudación de experimentos. No debe tratarse como un modelo desplegable.
- Las ejecuciones están incompletas: SAM lleva 4,0B de 8B tokens y OPUS 2,0B de 8B. Solo Rho-1 ha terminado el mid-training.
- El autor reconoce que no se ejecutó ni un solo paso real de reanudación por falta de 4 GPU libres en el servidor original; la validación se limitó a comprobaciones previas al lanzamiento.
- No se deben ejecutar `run.py accept` en los directorios del paquete: cambia el hash de la instantánea de código e invalida la reanudación de SAM y OPUS.
- No se deben modificar archivos del paquete ni borrar `runs/`.
- OPUS requiere ejecutar `rebind_opus_sidecar.py` cada vez que se mueva el directorio, porque el checkpoint guarda la ruta absoluta original.
- La licencia es `other` y el repositorio se declara solo para reproducción científica; cada dataset conserva su licencia original, lo que condiciona el uso comercial.
- Los datos de mid-training son una muestra de datasets públicos; no se detalla la composición exacta ni posibles sesgos.
- Riesgo de alucinación y sesgos del modelo resultante: no evaluado en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tzls/mt3-resume-rho1-sam-opus-20261113
- Modelo base Qwen3-1.7B-Base: no se proporciona enlace directo en la información disponible
- Paper o blog del método: no disponible
- Repositorio de código independiente: no disponible
- Demo: no disponible
