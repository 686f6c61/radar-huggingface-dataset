# SpaceGhost/LFM3-1.7B-Base

## Resumen

LFM3-1.7B-Base es el checkpoint preentrenado de la familia LFM3 desarrollada por Liquid AI, un modelo de lenguaje de 1.730 millones de parámetros diseñado específicamente para despliegue en el borde (edge). Se trata de un modelo base, no instruido, pensado como punto de partida para preentrenamiento continuado y postentrenamiento personalizado, no para uso conversacional directo. Su relevancia radica en la combinación de un contexto de 256.000 tokens con un consumo de memoria de aproximadamente 1 GB en cuantización de 4 bits, lo que lo hace viable en telefonos y portatiles.

La arquitectura es un transformer hibrido triple: de sus 24 capas, 13 son convoluciones cortas con compuerta (gated short convolutions), 5 son atención de ventana deslizante y 6 son atención global. Este diseno busca reducir el coste computacional del mecanismo de atención en secuencias largas manteniendo la capacidad de modelar dependencias globales. El modelo fue preentrenado con 22 billones de tokens, de los cuales los últimos 3,5 billones corresponden a datos de mid-training curados con trazas agenticas y llamadas a herramientas.

El checkpoint se distribuye bajo la licencia LFM Open License v1.0, soporta 16 idiomas (incluido el castellano) y un vocabulario de 128.000 tokens. Esta ficha se refiere a la copia alojada por el usuario SpaceGhost en HuggingFace, sin descargas ni interacciones registradas, que replica el modelo original de LiquidAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido triple: 24 capas (13 convoluciones cortas con compuerta, 5 atencion de ventana deslizante, 6 atencion global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; se distribuye en BF16 |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, castellano, vietnamita, tailandes, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | Safetensors (BF16) |
| Vocabulario | 128.000 tokens |
| Tamano del repositorio | 3,5 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que combina tres tipos de capas en una unica pila de 24 bloques: 13 capas de convolucion corta con compuerta, 5 capas de atención de ventana deslizante y 6 capas de atención global. Esta mezcla reduce el coste cuadratico de la atención en contextos largos, ya que la mayor parte de las capas procesan la secuencia con operaciones lineales o de ventana local, mientras que un subconjunto reducido de capas globales mantiene la capacidad de agregar informacion a lo largo de toda la secuencia. El resultado es un modelo capaz de manejar 256.000 tokens de contexto con una huella de memoria notablemente inferior a la de un transformer denso equivalente.

El preentrenamiento cubre 22 billones de tokens. Los últimos 3,5 billones constituyen una fase de mid-training con datos curados que incluyen trazas agenticas y llamadas a herramientas, y es en esta fase donde se extiende la ventana de contexto hasta los 256.000 tokens. No se especifica en la informacion disponible la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un checkpoint base, es esperable que no incluya alineamiento conversacional, aunque este extremo no se confirma en la documentacion. El modelo usa codigo personalizado (`custom_code`) y requiere `trust_remote_code=True` en Transformers.

## Capacidades

- Generacion de texto autoregresiva como modelo base; no incluye plantilla de chat ni comportamiento instruido.
- Razonamiento y conocimiento general derivados del preentrenamiento, sin ajuste especifico documentado.
- Capacidad de continuar texto, completar codigo y resolver tareas de estilo few-shot mediante prompting.
- Soporte nativo de contextos largos de hasta 256.000 tokens, adecuado para documentos extensos y concatenacion de multiples fuentes.
- Multilinguismo en 16 idiomas, con castellano incluido en la lista oficial.
- Exposicion a trazas agenticas y llamadas a herramientas durante el mid-training, lo que facilita el ajuste posterior para tool calling, aunque el modelo base no garantiza un formato de llamada estable.
- Punto de partida disenado para preentrenamiento continuado y postentrenamiento propio (SFT, DPO, RLHF).
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode) en este checkpoint.

## Casos de uso

- Preentrenamiento continuado en dominio especifico: partir de los pesos base y continuar el entrenamiento con corpus propietario (legal, medico, financiero) para adaptar el modelo sin coste de entrenamiento desde cero, aprovechando que el checkpoint esta pensado exactamente para esta tarea.
- Ajuste fino para asistentes en idiomas distintos del ingles: el vocabulario de 128.000 tokens y la cobertura de 16 idiomas permiten especializar el modelo en castellano o en lenguas con menos representacion mediante SFT sobre datos propios.
- Investigacion en postentrenamiento: servir como base controlada para experimentar con tecnicas de alineamiento (DPO, RLHF, decodificacion especulativa) comparando contra el modelo instruido LFM3-1.7B.
- Procesamiento de documentos largos en local: con 256.000 tokens de contexto, el modelo puede resumir o extraer informacion de contratos, expedientes o bases de conocimiento completas sin fragmentacion, ejecutandose en un portatil en cuantizacion de 4 bits.
- Generacion de codigo asistida en entornos con recursos limitados: al caber en aproximadamente 1 GB en 4 bits, puede desplegarse en un portatil o telefono para autocompletado y generacion de fragmentos de codigo, con ajuste previo sobre el lenguaje de programacion objetivo.
- Base para modelos de decision y agentes: dado que el mid-training incluye trazas agenticas y llamadas a herramientas, es un punto de partida adecuado para entrenar politicas de agente o clasificadores de acciones en entornos simulados.
- Experimentacion academica con arquitecturas hibridas: permite estudiar el comportamiento de la mezcla convolucion-atencion en tareas de modelado de lenguaje sin requerir infraestructura de gran escala.
- Prototipado de traduccion automatica: con 16 idiomas soportados y contexto largo, sirve para construir prototipos de traduccion de documentos completos tras un ajuste especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,5 GB solo para pesos, mas memoria para el estado de la KV cache y activaciones; en la practica se recomienda entre 5 y 8 GB para secuencias moderadas.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1 GB para pesos, segun la model card, lo que permite ejecucion en telefonos y portatiles.
- GPU recomendadas para BF16: NVIDIA A100, H100, L40S o RTX 4090 para inferencia comoda; cualquier GPU con 8 GB o mas puede ejecutar el modelo en precision reducida.
- GPU de consumo: cabe en RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas de portatiles tras cuantizacion.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (soporte oficial), vLLM y TGI si incorporan el codigo de la arquitectura hibrida, llama.cpp y Ollama previa conversion a GGUF (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada; el diseno con convoluciones y atencion de ventana deslizante deberia reducir el coste por token frente a un transformer denso de tamano similar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Base (este) | 1,73B | 256K | Hibrida (convolucion + atencion) | LFM Open License v1.0 | HuggingFace |
| LFM3-1.7B | 1,73B | 256K | Hibrida (convolucion + atencion) | LFM Open License v1.0 | HuggingFace, con postentrenamiento conversacional |
| Qwen2.5-1.5B | 1,54B | 32K | Transformer denso | Apache 2.0 | HuggingFace |
| SmolLM2-1.7B | 1,71B | 8K | Transformer denso | Apache 2.0 | HuggingFace |

La ventaja principal del LFM3-1.7B-Base frente a alternativas densas del mismo tamano es la ventana de contexto de 256.000 tokens y el diseno hibrido orientado a eficiencia en el borde. Como contrapartida, su licencia es mas restrictiva que las licencias Apache 2.0 de Qwen2.5-1.5B y SmolLM2-1.7B, y al ser un checkpoint base no ofrece comportamiento conversacional sin ajuste previo. No se dispone de datos de benchmarks que permitan comparar rendimiento real entre estos modelos.

## Limitaciones y advertencias

- Es un modelo base sin alineamiento conversacional: no debe usarse directamente como asistente sin un ajuste fino previo; para chat, tool calling y agentes la propia documentacion recomienda LFM3-1.7B.
- Riesgo de alucinacion y de generar contenido sesgado o toxico, inherente a los modelos preentrenados sobre datos web a gran escala; no se documentan mitigaciones en este checkpoint.
- La licencia LFM Open License v1.0 no es de codigo abierto estandar; es necesario revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Requiere `trust_remote_code=True` y codigo personalizado de modelado, lo que implica ejecutar codigo del autor y complica la integracion con frameworks que no soporten la arquitectura hibrida.
- El rendimiento en castellano no esta cuantificado; la presencia del idioma en la lista no garantiza calidad equiparable al ingles.
- El contexto de 256.000 tokens es una capacidad maxima; el rendimiento efectivo en secuencias muy largas no esta documentado y puede degradarse.
- Esta copia concreta (SpaceGhost/LFM3-1.7B-Base) no registra descargas ni interacciones, por lo que conviene verificar la integridad de los pesos frente al repositorio oficial de LiquidAI.
- No se documentan los tipos de cuantizacion soportados oficialmente; la conversion a GGUF u otros formatos requeriria validacion propia.

## Enlaces

- Modelo en HuggingFace (copia): https://huggingface.co/SpaceGhost/LFM3-1.7B-Base
- Modelo original en HuggingFace: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo instruido de la familia: https://huggingface.co/LiquidAI/LFM3-1.7B
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento: https://www.liquid.ai/blog/lfm3
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
