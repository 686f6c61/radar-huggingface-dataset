# taobao-mnn/Qwen3-1.7B-MNN

## Resumen

Qwen3-1.7B-MNN es la versión cuantizada y empaquetada para el motor de inferencia MNN del modelo denso Qwen3-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio lo publica taobao-mnn, el canal oficial de MNN (Mobile Neural Network), el runtime de inferencia de código abierto de Alibaba. El objetivo es ofrecer una variante del modelo lista para ejecutarse en CPU y dispositivos de borde mediante MNN, sin necesidad de GPUs ni de stacks de Python.

El modelo base es un transformer denso de 1.700 millones de parámetros con 28 capas y dimensión oculta de 2048, entrenado por Qwen con capacidad de alternar entre modo "thinking" (razonamiento explícito) y modo "non-thinking" (respuesta directa). Esta versión MNN aplica cuantización HQQ de 4 bits con grupo 64 a las capas lineales del modelo de lenguaje y 8 bits al output head, manteniendo las escalas de cuantización en FP16.

Es relevante porque demuestra un flujo completo de despliegue de un LLM moderno en entornos sin acelerador: el repositorio incluye grafo (`llm.mnn`), pesos (`llm.mnn.weight`), tokenizador (`tokenizer.mtok`) y configuración de ejecución (`config.json`, `llm_config.json`), junto con instrucciones de compilación verificadas contra un commit concreto de MNN 3.6.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 28 capas, hidden dim 2048 |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4-bit (grupo 64) en capas lineales; HQQ 8-bit (grupo 64) en output head; escalas FP16; embeddings compartidos con output head en 8-bit |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 (heredada del modelo upstream) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizador `tokenizer.mtok`; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer decoder-only denso con 28 capas y dimensión oculta de 2048, perteneciente a la familia Qwen3 de Alibaba. La familia Qwen3 incorpora modos de conversación con y sin razonamiento explícito (thinking / non-thinking), y el modelo card de esta exportación confirma esa capacidad para la variante 1.7B. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación de este repositorio no está en el entrenamiento sino en el empaquetado para inferencia: se aplica cuantización HQQ (Half-Quadratic Quantization) con tamaño de grupo 64, 4 bits para las capas lineales del transformer y 8 bits para el output head, con escalas en FP16. Los embeddings de entrada comparten los pesos de 8 bits del output head. El resultado se exporta al formato propietario de MNN, con un grafo (`llm.mnn`) y un fichero de pesos (`llm.mnn.weight`) que el runtime MNN-LLM carga directamente. La configuración por defecto apunta a CPU con 4 hilos, `precision=low` y `memory=low`, lo que indica que el objetivo de diseño es minimizar huella de memoria y requisitos de cómputo.

## Capacidades

- Generación de texto en chino e inglés, con pipeline `text-generation`.
- Razonamiento en dos modos: thinking (cadena de razonamiento explícita) y non-thinking (respuesta directa), según el modelo base Qwen3.
- Modelo instruction-tuned: sigue instrucciones conversacionales de formato chat.
- Capacidad matemática y de razonamiento de propósito general, heredada del modelo base (sin datos de benchmark específicos en esta exportación).
- Ejecución en CPU mediante MNN-LLM, con opciones de bajo consumo de memoria (`MNN_LOW_MEMORY=ON`) y fusión de operaciones de transformer (`MNN_SUPPORT_TRANSFORMER_FUSE=ON`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información proporcionada.

## Casos de uso

- Inferencia en dispositivos de borde sin GPU: el paquete MNN está pensado para ejecutarse en CPU con 4 hilos y configuración de baja memoria, lo que permite desplegar el modelo en mini-PC, routers con CPU potente o entornos embebidos donde no hay acelerador disponible.
- Aplicaciones móviles y de escritorio con MNN: al usar el runtime MNN de Alibaba, el modelo puede integrarse en apps nativas que ya emplean MNN para otras tareas de IA, reutilizando la misma infraestructura de despliegue.
- Asistentes conversacionales en chino e inglés: el modelo está instruction-tuned y soporta los dos modos de Qwen3, adecuado para chatbots multi-turno en esos dos idiomas.
- Prototipado rápido de pipelines de generación de texto: el comando `llm_demo` con un fichero de prompt permite validar respuestas y parámetros de muestreo sin montar un servidor de inferencia completo.
- Pruebas de razonamiento con presupuesto de cómputo reducido: el modo thinking permite obtener trazas de razonamiento en un modelo de 1,7B cuantizado a 4 bits, útil para experimentos educativos o de investigación con hardware modesto.
- Validación de cuantización HQQ en producción: equipos que evalúan la pérdida de calidad de HQQ 4-bit frente al modelo original pueden usar este repositorio como referencia reproducible, con hashes y registro de pruebas incluidos (`refresh_metadata.json`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card únicamente documenta una verificación funcional el 2026-11-09 en CPU x64: alineación de mapeo FP32, saludos, aritmética, traducción y pruebas de humo con la configuración por defecto, sin métricas numéricas de calidad ni de throughput.

## Requisitos de hardware

- Inferencia en CPU: configuración por defecto de 4 hilos, `precision=low` y `memory=low`; no requiere GPU.
- VRAM: no aplica en el flujo documentado (ejecución en CPU). El tamaño del repositorio es de 4,0 GB, lo que da una cota superior del espacio en disco necesario para pesos y ficheros auxiliares.
- GPU recomendadas: no disponible; el paquete está orientado a MNN en CPU y no se documentan rutas CUDA, Metal ni Vulkan para esta exportación concreta.
- ¿Cabe en GPU consumer? No se documenta; el objetivo declarado es CPU y dispositivos de borde.
- Opciones de despliegue: MNN-LLM (`llm_demo`) compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`, verificado contra el commit `b0239771b07b317a258fbc384683bbd540741406` de MNN 3.6.2. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-MNN (este) | 1,7B denso | no disponible | HQQ 4-bit / 8-bit, MNN | Apache 2.0 | Hugging Face, ModelScope |
| Qwen/Qwen3-1.7B (base) | 1,7B denso | no disponible | FP16/BF16 original (safetensors) | Apache 2.0 | Hugging Face |
| Otras exportaciones MNN de la familia Qwen3 | no disponible | no disponible | MNN cuantizado | Apache 2.0 | MNN / ModelScope |

La comparación relevante es contra el modelo original: esta versión sacrifica precisión numérica (4 bits en capas lineales) a cambio de ejecución en CPU con MNN. No se dispone de datos de benchmarks que cuantifiquen esa pérdida.

## Limitaciones y advertencias

- Idiomas: el model card declara únicamente chino e inglés; el rendimiento en castellano no está validado y probablemente sea inferior.
- Cuantización agresiva: HQQ 4-bit en capas lineales puede degradar razonamiento complejo, matemáticas y fidelidad de código respecto al modelo FP16 original; no hay métricas publicadas que cuantifiquen la pérdida.
- Riesgo de alucinación: inherente a los LLM de 1,7B; el tamaño reducido aumenta la probabilidad de errores factuales en dominios especializados.
- Longitud de contexto: no documentada en esta exportación; no debe asumirse el contexto nativo de Qwen3 sin verificar `llm_config.json`.
- Formato propietario: los pesos solo son utilizables con MNN; no hay conversión documentada a GGUF, safetensors ni otros runtimes, lo que limita la portabilidad.
- Dependencia de versión: las instrucciones de compilación fijan un commit concreto de MNN 3.6.2; otras versiones pueden romper la compatibilidad del grafo o del tokenizador.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo upstream Qwen3-1.7B; conviene revisar la licencia del modelo base por si añade términos adicionales.
- Madurez: 674 descargas y 1 like en el momento de la consulta; el soporte comunitario es limitado en comparación con las exportaciones GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-1.7B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- ModelScope: https://modelscope.cn/models/MNN/Qwen3-1.7B-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
