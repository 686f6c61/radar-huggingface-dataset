# speakleash/Bielik-11B-v3.0-Instruct-NVFP4

## Resumen

Bielik-11B-v3.0-Instruct-NVFP4 es una versión cuantizada a 4 bits en formato NVFP4 del modelo instructivo Bielik-11B-v3.0-Instruct, desarrollado por el proyecto polaco SpeakLeash. Se trata de un transformer decoder-only de tipo Llama con 11.168.796.672 parámetros, orientado a generación de texto, razonamiento e instrucciones multilingües, con especial énfasis en polaco y cobertura de más de treinta idiomas europeos. La cuantización reduce el peso del repositorio a 6,7 GB, lo que facilita su despliegue en hardware con memoria limitada.

La relevancia de esta variante reside en el formato NVFP4, un esquema de cuantización de 4 bits con calibración AWQ y rangos FP4 optimizados por MSE, que busca preservar la calidad del modelo original reduciendo drásticamente los requisitos de VRAM. El modelo base se distribuye bajo licencia Apache 2.0, y esta versión cuantizada conserva la misma licencia, lo que permite uso comercial sin restricciones adicionales.

Al estar construida sobre Bielik-11B-v3.0-Instruct, hereda el tokenizador y la plantilla de chat originales, lo que simplifica la migración desde el modelo completo. Es una opción adecuada para entornos de producción con GPUs de gama media o para servir múltiples instancias en un mismo nodo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (según tags del repo) |
| Parámetros totales | 11.168.796.672 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (pesos y activaciones FP4); variante NVFP4A16 con activaciones de 16 bits; grupo de tamaño 16 |
| Idiomas soportados | Multilingüe: pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit de almacenamiento, NVFP4) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama con 11.168 millones de parámetros, según los metadatos de safetensors y los tags del repositorio. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) del modelo original.

La innovación técnica de esta ficha es el proceso de cuantización: se aplica un escalado de canales AWQ calibrado, seguido de rangos de pesos FP4 expandidos por MSE, con tamaño de grupo 16. La calibración utiliza 384 ejemplos con longitud máxima de secuencia de 2048. El formato NVFP4 cuantiza pesos y activaciones a FP4, mientras que la variante NVFP4A16 mantiene las activaciones en 16 bits. Se preservan el tokenizador y la plantilla de chat originales, y la revisión de origen del modelo base es `735bfee1125fe8b497ac2769de94822a11f77167`.

## Capacidades

- Generación de texto e instrucciones en más de treinta idiomas, con especial cobertura del polaco y el inglés.
- Razonamiento y respuesta a instrucciones en formato conversacional, gracias a la plantilla de chat heredada del modelo instructivo.
- Soporte de conversaciones multi-turno mediante la plantilla de chat original.
- Capacidades multilingües amplias: lenguas eslavas (pl, cs, sk, sl, hr, sr, bs, bg, ru, uk, bel), germánicas (en, de, nl, da, sv, no, is), romances (es, fr, it, pt, ro), bálticas (lt, lv, et), además de fi, el, hu, sq y tr.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la documentación proporcionada.

## Casos de uso

- Atención al cliente en polaco y otras lenguas europeas: el modelo puede gestionar conversaciones multi-turno en su idioma principal y en una treintena de lenguas adicionales, lo que permite desplegar un único modelo para mercados de Europa central y del este.
- Generación de contenido editorial multilingüe: redacción y adaptación de textos en polaco, checo, eslovaco, húngaro o rumano, aprovechando la cobertura lingüística del modelo para localización de contenidos.
- Asistencia a la traducción entre lenguas eslavas y romances: útil como borrador o post-edición en flujos de traducción automática, especialmente en pares con poca representación en modelos generalistas.
- Procesamiento de documentación administrativa y legal polaca: resumen y extracción de información de textos largos en polaco, un dominio donde los modelos entrenados específicamente en ese idioma suelen rendir mejor.
- Despliegue en GPUs de gama media: gracias a la cuantización NVFP4 y al tamaño de 6,7 GB del repositorio, es viable servir el modelo en tarjetas con 16-24 GB de VRAM, reduciendo costes de infraestructura frente al modelo en bf16.
- Servicio de múltiples instancias por nodo: el menor consumo de memoria permite alojar varias réplicas en una sola GPU o nodo, útil para entornos de desarrollo, pruebas A/B o servicios con alta concurrencia y baja latencia.
- Chatbot interno para empresas con plantilla de chat compatible con OpenAI: al conservar el tokenizador y la plantilla originales, se integra con frameworks de serving estándar sin adaptaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,7 GB en formato NVFP4; se recomienda al menos 8-12 GB de VRAM para pesos y overhead de inferencia, y 16-24 GB para contextos largos y lotes mayores.
- GPU recomendadas: NVIDIA H100, A100, L40S y GPUs con soporte de FP4 (arquitecturas Blackwell) para aprovechar plenamente el formato NVFP4; en GPUs sin soporte nativo de FP4 el rendimiento puede degradarse.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 5080/5090), siempre que el runtime soporte compressed-tensors y NVFP4.
- Opciones de despliegue: vLLM y TGI con soporte de compressed-tensors/NVFP4; para GPUs sin soporte FP4 puede requerirse conversión a otro formato (GGUF, AWQ, GPTQ) mediante herramientas de cuantización.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-11B-v3.0-Instruct-NVFP4 | 11,17 B | No disponible | Apache 2.0 | safetensors NVFP4 | Hugging Face |
| Bielik-11B-v3.0-Instruct (base) | 11,17 B | No disponible | Apache 2.0 | safetensors bf16 | Hugging Face |
| Bielik-11B-v2.3-Instruct | No disponible en la información | No disponible | Apache 2.0 | safetensors | Hugging Face |
| Modelos Llama-3.1-8B-Instruct | 8 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Hugging Face |

La comparación con Llama-3.1-8B-Instruct se ofrece como referencia de categoría (modelo instructivo de ~8-11 B parámetros); no se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a FP4 puede introducir degradación de calidad respecto al modelo en bf16, especialmente en tareas de razonamiento complejo, matemáticas y generación de código; se recomienda evaluar en el dominio concreto antes de producción.
- El formato NVFP4 requiere runtimes y GPUs con soporte específico; en hardware sin soporte nativo de FP4 el modelo puede no ejecutarse o hacerlo con conversión previa.
- No se dispone de información sobre sesgos específicos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad en la información disponible.
- La longitud de contexto no está documentada en la ficha; debe verificarse en la model card del modelo base antes de diseñar aplicaciones que dependan de ventanas largas.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.

## Enlaces

- [Hugging Face: speakleash/Bielik-11B-v3.0-Instruct-NVFP4](https://huggingface.co/speakleash/Bielik-11B-v3.0-Instruct-NVFP4)
- [Modelo base: speakleash/Bielik-11B-v3.0-Instruct](https://huggingface.co/speakleash/Bielik-11B-v3.0-Instruct)
- [Organización SpeakLeash en Hugging Face](https://huggingface.co/speakleash)
