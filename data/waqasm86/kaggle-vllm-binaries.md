# waqasm86/kaggle-vllm-binaries

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de distribución de software: una rueda (wheel) de vLLM compilada y validada específicamente para ejecutarse en notebooks de Kaggle con dos GPU NVIDIA Tesla T4 (arquitectura SM75). El autor, Mohammad Waqas, ingeniero de sistemas especializado en inferencia LLM acelerada por GPU, empaqueta el motor de inferencia vLLM (versión upstream v0.18.1) junto con un SDK ligero llamado `kaggle-vllm` (versiones 0.1.0 y 0.1.1) que facilita el arranque del binario nativo en entornos Kaggle.

La relevancia de este artefacto radica en que Kaggle ofrece GPUs T4 de forma gratuita en sus notebooks, pero la instalación estándar de vLLM mediante `pip install vllm` suele fallar o requerir compilación manual debido a dependencias específicas de CUDA y PyTorch. Este repositorio proporciona un binario precompilado y verificado por checksum, junto con instrucciones de instalación que evitan reemplazar la pila de Torch de Kaggle, permitiendo a los desarrolladores desplegar inferencia de LLMs con vLLM en ese entorno sin fricciones. No es un binario oficial de vLLM, sino un empaquetado independiente con validación funcional documentada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vLLM (motor de inferencia), no un modelo de lenguaje |
| Parametros totales | no aplica (no es un modelo) |
| Parametros activos | no aplica (no es un modelo) |
| Longitud de contexto | no aplica (depende del modelo servido) |
| Tipos de cuantizacion | no aplica (el binario soporta FP16 y cuantizaciones del modelo servido) |
| Idiomas soportados | no aplica (depende del modelo servido) |
| Licencia | Apache-2.0 (para el binario vLLM incluido); la licencia del repositorio no esta especificada |
| Formato de pesos | no aplica (distribuye un wheel de Python, no pesos de modelo) |

## Arquitectura y entrenamiento

Este artefacto no es un modelo entrenado, sino un empaquetado del motor de inferencia vLLM. El binario corresponde a la versión upstream v0.18.1, con commit `a26e8dc7ff2111a005144d775ecf9cebf56c45b2` y versión de wheel `0.18.2.dev0+ga26e8dc7f.d20260822.cu128`. Se compiló para CPython 3.12 en Linux x86_64 con soporte CUDA 12.8. La validación se realizó en un notebook de Kaggle con Python 3.12.13, PyTorch 2.10.0+cu128, CUDA toolkit 12.8.93, driver 580.159.04, NCCL 2.27.5 y dos GPU Tesla T4 (SM75). Durante las pruebas, vLLM seleccionó automáticamente el backend `TRITON_ATTN` porque FlashAttention 2 no está disponible en la arquitectura SM75. El proyecto asociado `kaggle-vllm` documenta un procedimiento de instalación con `pip --target --no-deps` y verificación de checksums para no interferir con la pila de Torch de Kaggle.

## Capacidades

- Inferencia de modelos de lenguaje con vLLM, incluyendo generación de texto y razonamiento, dependiendo del modelo cargado.
- Soporte de tensor parallelism (TP=2) validado con dos GPU Tesla T4, permitiendo ejecutar modelos que no caben en una sola GPU.
- Servicio compatible con la API de OpenAI, validado en el entorno de Kaggle.
- Persistencia y recarga de estados fragmentados (`sharded_state`) de modelos, útil para checkpointing y despliegue distribuido.
- Compatibilidad con modelos FP16, como Qwen2.5-3B, que se usó en la validación.
- Integración con el SDK `kaggle-vllm` que simplifica el arranque del binario nativo sin reemplazar dependencias del sistema.

## Casos de uso

- Despliegue de un LLM en un notebook de Kaggle: los usuarios pueden instalar el binario y servir un modelo como Qwen2.5-3B con la API de OpenAI, aprovechando las GPU T4 gratuitas de Kaggle para experimentación y prototipado.
- Inferencia con tensor parallelism en entornos con múltiples GPU: el binario validado con TP=2 permite ejecutar modelos de mayor tamaño en las dos T4 de un notebook Kaggle, algo que no sería posible con una sola GPU.
- Integración en pipelines de evaluación de modelos: investigadores pueden usar vLLM en Kaggle para medir rendimiento de LLMs sin necesidad de infraestructura propia, gracias a la instalación verificada y reproducible.
- Entornos de desarrollo local con GPU T4: el binario puede usarse fuera de Kaggle en máquinas con GPUs SM75, siempre que se repliquen las versiones de CUDA, PyTorch y driver documentadas.
- Automatización de tareas de generación de texto en entornos con recursos limitados: el SDK `kaggle-vllm` permite arrancar el servicio de forma programática, facilitando su integración en scripts y notebooks.
- Formación y educación: sirve como referencia práctica para entender cómo compilar y validar vLLM en entornos con GPUs antiguas, mostrando las limitaciones de FlashAttention y las alternativas como TRITON_ATTN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La validación documentada cubre aspectos funcionales (imports, inferencia single-GPU, TP=2, serving OpenAI-compatible) pero no incluye métricas de latencia, throughput ni comparaciones con otras versiones de vLLM.

## Requisitos de hardware

- GPU: dos NVIDIA Tesla T4 (arquitectura SM75) validadas; el binario no garantiza compatibilidad con otras arquitecturas.
- VRAM: 16 GB por GPU T4; suficiente para modelos como Qwen2.5-3B en FP16 con TP=2.
- CPU y RAM: no especificados, pero se asume un entorno de notebook Kaggle estándar.
- Software: Python 3.12, PyTorch 2.10.0+cu128, CUDA toolkit 12.8.93, driver 580.159.04, NCCL 2.27.5.
- Opciones de despliegue: el binario se instala como wheel de Python y se ejecuta mediante el SDK `kaggle-vllm`; no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No aplica directamente porque no es un modelo de lenguaje, sino un empaquetado de vLLM. Como alternativa de instalación, se puede comparar con:

| Opcion | Descripcion | Ventajas | Limitaciones |
|---|---|---|---|
| `pip install vllm` (oficial) | Instalación estándar desde PyPI | Binario oficial, soporte amplio | Puede fallar en Kaggle por dependencias de Torch; requiere compilación en algunos entornos |
| Compilación desde fuente | Construir vLLM manualmente | Control total sobre versiones | Complejo y lento, requiere toolchain de CUDA |
| Este repositorio | Wheel precompilado y validado para Kaggle T4 | Instalación rápida y verificada, no reemplaza Torch de Kaggle | Solo validado para un entorno específico; no es oficial |

## Limitaciones y advertencias

- No es un binario oficial de vLLM; el autor declara explícitamente que no es un fork ni una reclamación de propiedad sobre el proyecto upstream.
- La compatibilidad solo está garantizada para el entorno validado (Python 3.12, PyTorch 2.10.0+cu128, CUDA 12.8, driver 580.159.04, dos T4). No se reclama compatibilidad universal con otras configuraciones.
- FlashAttention 2 no está disponible en la arquitectura SM75; vLLM usa TRITON_ATTN, lo que puede afectar al rendimiento en comparación con GPUs más modernas.
- El repositorio no especifica una licencia propia; solo se menciona que el binario vLLM incluye la licencia Apache-2.0. El uso comercial del artefacto debe evaluarse con cuidado.
- La instalación requiere seguir el procedimiento documentado con `pip --target --no-deps` y verificación de checksums; ignorar estas instrucciones puede romper la pila de Torch de Kaggle.
- No se proporcionan métricas de rendimiento ni benchmarks, por lo que no es posible evaluar la eficiencia del binario frente a otras versiones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/waqasm86/kaggle-vllm-binaries
- Proyecto asociado en GitHub: https://github.com/kaggle-vllm/kaggle-vllm
- Perfil del autor en GitHub: https://github.com/waqasm86
- Repositorio alternativo en Hugging Face (mismo contenido): https://huggingface.co/waqasm86/vllm-kaggle-binaries
- Referencia upstream de vLLM: https://github.com/vllm-project/vllm
