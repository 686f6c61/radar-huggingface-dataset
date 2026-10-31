# thousandml/Llama-3.1-8B-Instruct-CQ-4bit

## Resumen

Llama-3.1-8B-Instruct-CQ-4bit es una versión cuantizada a 4 bits del modelo meta-llama/Llama-3.1-8B-Instruct, publicado por thousandml en Hugging Face. La cuantización emplea Coded Quantization (CQ), un método post-training sin calibración (calibration-free) que no necesita un dataset representativo para estimar los parámetros de cuantización, evitando así que el modelo cuantizado quede ligado a la distribución de un corpus concreto.

El problema que resuelve es doble: por un lado reduce drásticamente la memoria de pesos respecto al despliegue en BF16/FP16 (el repositorio ocupa 10,4 GB frente a los ~16 GB que ocuparían los pesos en BF16), y por otro pretende mantener la fidelidad al modelo original sin el sesgo introducido por datos de calibración. El modelo se ejecuta de forma nativa en vLLM mediante un plugin de cuantización CQ y kernels CUDA personalizados distribuidos en una imagen Docker de ThousandML.

Es relevante como alternativa a otros formatos de cuantización a 4 bits (GPTQ, AWQ) para despliegues de inferencia servida con vLLM, manteniendo intactas las capacidades de Llama 3.1 8B Instruct: generación de texto conversacional, razonamiento y tool calling, con licencia Llama 3.1 Community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1) |
| Parametros totales | 8B (el Hub muestra 1.101.271.040 por el empaquetado 4-bit de CQ) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 soporta 128K tokens) |
| Tipos de cuantizacion | Coded Quantization (CQ) 4-bit, sin calibración |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | safetensors (representación empaquetada 4-bit CQ) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1: un transformer decoder autorregresivo optimizado para inferencia, con atención agrupada de consultas (GQA) según la familia base. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es el checkpoint instruct de 8B de Meta convertido a una representación cuantizada. Por tanto, no hay datos de entrenamiento adicionales, ni RLHF/DPO propios de esta versión; todo el proceso de alineación corresponde al modelo base de Meta.

La innovación técnica de este repositorio es el método de cuantización. Coded Quantization (CQ) es un enfoque post-training cuantización sin calibración: a diferencia de métodos como GPTQ o AWQ, que optimizan los parámetros de cuantización usando un dataset de calibración (lo que puede degradar el rendimiento en dominios no cubiertos por ese dataset), CQ no requiere corpus de calibración alguno. Según el autor, esto permite una mayor generalización a cargas de trabajo diversas manteniendo la fidelidad al modelo original. Los pesos se almacenan en una representación empaquetada de 4 bits, y la inferencia requiere el plugin de cuantización `cq` de vLLM junto con kernels CUDA personalizados incluidos en la imagen Docker de ThousandML.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.1 8B Instruct.
- Razonamiento general y resolución de problemas de instrucciones complejas.
- Generación y comprensión de código (capacidad del modelo base).
- Resolución de problemas matemáticos (capacidad del modelo base).
- Soporte de tool calling / function calling, heredado del modelo base Llama 3.1 Instruct.
- Capacidades multilingües del modelo base (8 idiomas oficiales, entre ellos el español).
- Compatibilidad con la API OpenAI-compatible de vLLM para integración en aplicaciones.
- No incluye capacidades nativas de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Servidor de inferencia autoalojado con API OpenAI: el despliegue recomendado expone directamente el endpoint `/v1/chat/completions` de vLLM en el puerto 8000, lo que permite integrarlo con cualquier cliente compatible con OpenAI (LangChain, openai-python, etc.).
- Chatbots y asistentes conversacionales: al ser una versión instruct cuantizada a 4 bits, reduce el coste de memoria por instancia y permite servir más usuarios concurrentes por GPU en producción.
- Ahorro de VRAM en GPUs de consumo y de gama media: con pesos en 4 bits (~10,4 GB el repositorio completo), el modelo cabe en GPUs con 16-24 GB de VRAM, algo inviable en BF16 para configuraciones con contexto largo.
- Evaluación de la cuantización CQ sin calibración: útil para equipos que quieren comparar la degradación de CQ frente a GPTQ/AWQ en dominios no cubiertos por datasets de calibración típicos.
- Prototipado rápido de aplicaciones LLM: la imagen Docker de ThousandML encapsula vLLM, el plugin CQ y los kernels CUDA, eliminando la fricción de instalación y permitiendo levantar el servicio con un solo comando.
- Procesamiento por lotes de texto (análisis, resumen, clasificación): el throughput de vLLM con pesos en 4 bits maximiza el número de peticiones por hora en cargas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye comparativas de calidad (MMLU, HumanEval, GSM8K, etc.) entre el modelo original en BF16 y la versión CQ 4-bit, por lo que no es posible verificar cuantitativamente la fidelidad del método de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10-12 GB solo de pesos (repo de 10,4 GB), más la memoria para la KV cache según la longitud de contexto configurada; 16 GB de VRAM es un mínimo razonable para uso práctico.
- GPU recomendadas: cualquier GPU NVIDIA moderna con soporte CUDA (los kernels CQ son CUDA personalizados); RTX 4090, RTX 5090, A100 o H100 son opciones adecuadas.
- Cabe en GPUs de consumo: sí, en modelos con 16 GB o más de VRAM (RTX 4060 Ti 16GB, RTX 4080, RTX 4090); en GPUs de 12 GB puede ser ajustado según el contexto.
- Despliegue: exclusivamente mediante la imagen Docker `docker.io/thousandml/cq:4bit-main`, que incluye vLLM con el plugin de cuantización `cq` y los kernels CUDA personalizados. No es compatible con llama.cpp, Ollama ni TGI, y en vLLM estándar requiere pasar `--quantization cq`.
- En WSL2, si vLLM reporta que UVA no está disponible, hay que activar la variable `VLLM_WSL2_ENABLE_PIN_MEMORY=1`.
- Latencia y throughput estimados: no disponible (no se publican cifras).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Runtime | Licencia |
|---|---|---|---|---|
| thousandml/Llama-3.1-8B-Instruct-CQ-4bit | 8B | CQ 4-bit (sin calibración) | vLLM + kernels CQ (Docker propio) | Llama 3.1 Community |
| meta-llama/Llama-3.1-8B-Instruct | 8B | BF16 (sin cuantizar) | vLLM, TGI, llama.cpp, Ollama | Llama 3.1 Community |
| Versiones GPTQ/AWQ 4-bit de Llama 3.1 8B Instruct (comunidad) | 8B | GPTQ o AWQ 4-bit (con calibración) | vLLM, ExLlama, Transformers | Llama 3.1 Community |

La diferencia principal frente a las variantes GPTQ/AWQ es que CQ no emplea dataset de calibración, lo que según el autor mejora la generalización a dominios no cubiertos. A cambio, la compatibilidad de runtimes es más limitada: solo funciona con el ecosistema Docker/vLLM de ThousandML, mientras que GPTQ y AWQ cuentan con soporte mucho más amplio.

## Limitaciones y advertencias

- Compatibilidad de runtime muy restringida: solo funciona con la imagen Docker de ThousandML (vLLM + plugin CQ + kernels CUDA); no es compatible con llama.cpp, Ollama, TGI ni con la mayoría de herramientas del ecosistema local.
- Requiere GPU NVIDIA con soporte CUDA; no hay ruta de ejecución en CPU ni en Apple Silicon documentada.
- Ausencia de benchmarks publicados: no hay datos verificables de la degradación de calidad respecto al modelo original en BF16, un riesgo habitual en cualquier cuantización a 4 bits.
- La cuantización a 4 bits puede introducir ligera degradación en tareas sensibles (matemáticas, código complejo, instrucciones muy precisas), aunque CQ afirma minimizarla; conviene validar en el dominio de uso concreto.
- Posible riesgo de alucinación heredado del modelo base Llama 3.1 8B Instruct, que puede generar información incorrecta con apariencia plausible.
- Licencia: Llama 3.1 Community License Agreement permite uso comercial, pero impone restricciones (límite de 700 millones de usuarios activos mensuales sin licencia específica de Meta, política de uso aceptable y requisitos de atribución/nomenclatura). Hay que revisar los términos del modelo base de Meta.
- El contador de parámetros del Hub (1.101.271.040) no refleja el tamaño real del modelo (8B) porque CQ almacena los pesos empaquetados en 4 bits; esto puede confundir en herramientas automatizadas que filtren por tamaño.
- Proyecto de un autor individual (thousandml) con pocas descargas (283) y sin comunidad consolidada: conviene evaluar el riesgo de mantenimiento y soporte a largo plazo antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thousandml/Llama-3.1-8B-Instruct-CQ-4bit
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Sitio web de ThousandML (información sobre Coded Quantization): https://thousandml.com
- Imagen Docker de CQ: docker.io/thousandml/cq:4bit-main
- Paper, blog técnico o demos adicionales: no disponible
