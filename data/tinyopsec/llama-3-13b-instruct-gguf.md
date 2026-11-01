# tinyopsec/Llama-3-13B-Instruct-GGUF

## Resumen

Llama-3-13B-Instruct (GGUF) es una cuantización en formato GGUF del modelo `elinas/Llama-3-13B-Instruct`, un modelo derivado de Meta-Llama-3-8B-Instruct creado mediante una fusión por passthrough de slices del modelo base de 8B, que da como resultado un modelo de aproximadamente 13.047 millones de parámetros. El repositorio, publicado por el usuario tinyopsec, ofrece el modelo cuantizado en trece niveles distintos, desde F16 hasta Q2_K, para su uso con llama.cpp y runtimes compatibles.

El propósito del modelo es la generación de texto conversacional y escritura creativa (chat y storywriting). No se trata de un modelo entrenado desde cero ni ajustado con datos adicionales, sino de un merge estructural: la técnica passthrough combina capas del modelo original para aumentar la profundidad del modelo resultante. Esto lo hace interesante como experimento de escalado por fusión, aunque el propio autor advierte que las capacidades lógicas (programación, matemáticas, ciencia) pueden verse degradadas respecto al modelo base.

Es relevante como ejemplo de la práctica de merges de modelos abiertos sobre la familia Llama 3, muy popular en la comunidad de código abierto, y como opción para ejecutar localmente un modelo de tamaño intermedio (13B) en hardware de consumo, gracias a la amplia gama de cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3), merge passthrough de Llama-3-8B-Instruct |
| Parametros totales | 13.046.837.248 (~13B) |
| Parametros activos | no disponible (no es MoE; todos los parametros activos) |
| Longitud de contexto | no disponible (el modelo base Llama 3 usa 8.192 tokens) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el modelo base Llama 3 esta orientado principalmente al ingles) |
| Licencia | Meta Llama 3 Community License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder autorregresivo con atención agrupada por consultas (GQA), normalización RMSNorm y activaciones SwiGLU. La variante de 13B se obtiene mediante un merge passthrough: se toman slices (bloques de capas) de Llama-3-8B-Instruct y se concatenan para construir un modelo más profundo, pasando de 32 capas del original a una arquitectura ampliada con unos 13B de parámetros. Esta técnica no implica entrenamiento adicional con nuevos datos, por lo que el modelo hereda directamente el comportamiento del modelo instruido original.

En cuanto al entrenamiento del modelo base, Meta-Llama-3-8B-Instruct fue preentrenado por Meta con más de 15 trillones de tokens de datos públicos y posteriormente alineado mediante SFT y RLHF con preferencias humanas para el uso como asistente conversacional. No hay información sobre entrenamiento adicional específico de este merge. El propio autor incluye una advertencia importante: al tratarse de un modelo fusionado, la capacidad lógica (programación, matemáticas, ciencia) puede estar degradada, y recomienda no usar penalty de repetición o mantenerlo por debajo de 1,05.

## Capacidades

- Generación de texto conversacional (chat), heredada de Llama-3-8B-Instruct.
- Escritura creativa y narrativa (storywriting), uso principal indicado por el autor del merge.
- Seguimiento de instrucciones en formato de chat del modelo base Llama 3.
- Razonamiento general, con la advertencia explicita de posible degradación en programación, matemáticas y ciencia.
- Compatibilidad con cualquier runtime que soporte GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).
- No hay información sobre soporte de tool calling, function calling, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Chatbot local y privado: ejecutando la cuantización Q4_K_M en un portátil o PC de consumo, se puede montar un asistente conversacional sin enviar datos a servicios externos, útil para entornos con requisitos de privacidad.
- Escritura creativa asistida: con koboldcpp o LM Studio, el modelo puede servir para coescribir relatos y ficción, el uso para el que fue creado según su autor.
- Experimentación con merges de modelos: al ser un passthrough merge documentado, es útil para investigadores que quieran estudiar cómo la fusión de slices afecta al comportamiento de un modelo instruido.
- Prototipado de aplicaciones LLM: su compatibilidad con Ollama y llama.cpp permite integrarlo rápidamente en prototipos con APIs locales tipo OpenAI (llama.cpp server) antes de escalar a modelos mayores.
- Pruebas de cuantización: con trece niveles de cuantización disponibles, es un buen banco de pruebas para comparar la degradación de calidad entre F16 y Q2_K en hardware limitado.
- Generación de texto por lotes en CPU: las cuantizaciones bajas (Q3, Q2) permiten inferencia en máquinas sin GPU dedicada, adecuada para tareas de generación masiva no crítica en calidad lógica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~13B):
  - F16: unos 26 GB (el archivo ocupa 26,1 GB), requiere GPU con 24 GB más RAM o descarga parcial en CPU.
  - Q8_0: aproximadamente 14 GB.
  - Q6_K: aproximadamente 11 GB.
  - Q5_K_M: aproximadamente 9-10 GB.
  - Q4_K_M (recomendada): aproximadamente 8 GB.
  - Q3 y Q2_K: entre 5 y 7 GB.
- GPU recomendadas: RTX 4090 (24 GB) ejecuta cómodamente F16 o Q8_0 a plena velocidad; RTX 3090 (24 GB) similar; RTX 4070 Ti Super o 4080 (16 GB) para Q6_K y Q5; RTX 4060 Ti 8 GB o superior para Q4_K_M.
- Consumer GPU: sí, la Q4_K_M cabe en GPUs de 8 GB y las cuantizaciones Q3/Q2 en GPUs de 6 GB; también es viable en CPU pura con RAM suficiente (16 GB para Q4, 32 GB para F16 con offload).
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama, LM Studio, koboldcpp, y en general cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3-13B-Instruct (este modelo, merge) | ~13B | no disponible (base: 8.192 tokens) | Llama 3 Community | GGUF, HuggingFace |
| Meta-Llama-3-8B-Instruct (base) | 8B | 8.192 tokens | Llama 3 Community | safetensors y GGUF de terceros |
| Llama-3.1-8B-Instruct | 8B | 131.072 tokens | Llama 3.1 Community | safetensors, GGUF, oficial de Meta |

Frente a su modelo base de 8B, esta variante ofrece un modelo más profundo (13B) que puede comportarse de forma algo distinta en generación creativa, a costa de mayor consumo de memoria y de la posible degradación lógica advertida por el autor. Frente a Llama-3.1-8B-Instruct, pierde claramente en longitud de contexto (8K frente a 128K) y en actualidad del entrenamiento, por lo que se recomienda preferir la versión 3.1 salvo que el interés sea específicamente el merge o la escritura creativa.

## Limitaciones y advertencias

- El propio autor advierte que, al ser un modelo fusionado, la capacidad lógica (programación, matemáticas, ciencia) puede estar degradada respecto al modelo base; recomienda evaluarlo antes de usarlo en producción.
- Recomendación de muestreo: no usar penalty de repetición o mantenerlo por debajo de 1,05.
- Riesgo de alucinación inherente a los LLM, agravado por la naturaleza del merge sin ajuste posterior.
- Idiomas: no disponible en la ficha; el modelo base Llama 3 está centrado principalmente en inglés, por lo que el rendimiento en castellano no está garantizado ni documentado.
- Licencia: Meta Llama 3 Community License, que impone condiciones de uso (atribución "Built with Meta Llama 3", política de uso aceptable y restricciones adicionales para productos con más de 700 millones de usuarios mensuales). Cualquier derivado queda ligado a esa licencia.
- No hay información sobre tool calling, agentes ni contexto largo, por lo que no es adecuado para casos de uso que dependan de esas capacidades.
- Baja tracción comunitaria (475 descargas, 0 likes en el momento de la ficha), lo que implica menos pruebas por parte de usuarios y menos reportes de problemas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tinyopsec/Llama-3-13B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Modelo original fusionado: https://huggingface.co/elinas/Llama-3-13B-Instruct
- Licencia Meta Llama 3 Community License: https://llama.meta.com/llama3/license
- llama.cpp: https://github.com/ggerganov/llama.cpp
