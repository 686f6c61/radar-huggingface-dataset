# SupersonicLabs/Julia-2-Flash

## Resumen

Julia 2 Flash es un modelo de decisión compacto desarrollado por Supersonic Labs, pensado para responder preguntas estructuradas sobre entradas multimodales (texto, JSON, imágenes, audio y llamadas en vivo) en lugar de generar texto libre. Es la versión reducida de Julia 2, del que hereda la misma API y los mismos tipos de pregunta (`choice`, `score`, `noul`), pero con un 69 % menos de peso: 658 MB frente a 2,14 GB. Su formato de salida es una decisión acotada o una puntuación, no una secuencia de tokens, lo que lo sitúa en la categoría de modelos de clasificación y zero-shot classification más que en la de asistentes conversacionales.

La reducción de tamaño se consigue mediante cuantización agresiva: el tronco de decisión en int4 con grupos de 128 (ocho capas en int8), la tabla de tokens en int4 para tokens frecuentes e int2 para los raros, la torre de visión en int8 y la de audio en int4. Se conservan 20 de las 24 capas del tronco original. El resultado es un consumo pico de 1,08 GB de VRAM en GPU frente a los 3,74 GB de Julia 2, y un tiempo de carga de 1,2 s.

El modelo es relevante para despliegues con restricciones fuertes de memoria o latencia, como clasificación de intenciones en audio, enrutado de decisiones en agentes o etiquetado multimodal a gran escala, donde no se necesita generación abierta sino una respuesta cerrada y rápida. La licencia Apache-2.0 facilita su integración comercial. No obstante, el propio autor advierte de que las respuestas individuales pueden variar respecto a Julia 2 aunque la precisión media se mantenga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión multimodal con tronco recurrente (trunk) de 24 capas, del que se conservan 20; torre de visión y torre de audio independientes; runtime propio `julia2` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el runtime expone `JULIA2_TOKEN_BUDGET`, con 1024 tokens en configuración de bajo consumo) |
| Tipos de cuantizacion | Tronco int4 (grupos de 128) con 8 capas en int8; tabla de tokens int4/int2; visión int8; audio int4 (grupos de 128); normas, readout y estado recurrente en mayor precisión |
| Idiomas soportados | en, pt, es, de, fr y multilingüe (evaluado además en 14 idiomas adicionales vía MASSIVE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`text.safetensors` 427 MB, `image.safetensors` 116 MB, `audio.safetensors` 115 MB) |

## Arquitectura y entrenamiento

Julia 2 Flash es un fine-tune del modelo base SupersonicLabs/Julia-2, del que hereda la arquitectura de decisión: un tronco recurrente que procesa el estado de la consulta y emite respuestas del tipo `choice` (elegir entre opciones con criterios), `score` (puntuación) o `noul` (respuesta binaria o nula). A ese tronco se le acoplan dos torres especializadas, una de visión y otra de audio, que codifican las entradas no textuales antes de la decisión. El modelo no genera texto libre; su salida es una decisión estructurada.

La innovación principal de esta variante es la compresión por cuantización selectiva: el tronco se reduce a int4 en grupos de 128, pero se mantienen ocho capas en int8 y los componentes sensibles (normas, readout y estado recurrente) en mayor precisión para preservar la calidad. La tabla de tokens usa una asignación por frecuencia (int4 para tokens comunes, int2 para raros). No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El runtime incluye opciones de despliegue en CPU con dequantización compilada (`JULIA2_CPU_KEEP_QUANT`, `JULIA2_COMPILED_DEQUANT`).

## Capacidades

- Clasificación y decisión multimodal: responde preguntas de tipo `choice`, `score` y `noul` sobre texto, JSON, imágenes y audio.
- Procesamiento de imágenes: torre de visión propia, evaluada en Imagenette y Oxford Flowers.
- Procesamiento de audio: torre de audio para intenciones de voz (evaluada en MInDS-14) y discriminación fina de frases (FLEURS pt-BR y en-US).
- Soporte de llamadas en vivo ("live calls") según los tags y los tests de release del autor.
- Clasificación zero-shot y multiple-choice mediante instrucciones y criterios en la consulta.
- Multilingüe: inglés, portugués, español, alemán y francés como idiomas principales, más 14 idiomas adicionales evaluados.
- Procesamiento por lotes (batching): 64 preguntas de texto en 171 ms en GPU.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Clasificación de intenciones en audio para atención al cliente: el modelo recibe clips de voz y devuelve la intención como `choice`, con una torre de audio de 115 MB que permite procesar 2.413 clips en pruebas; adecuado para enrutar llamadas sin transcripción previa.
- Enrutado de decisiones en agentes: dado un estado en JSON y un conjunto de acciones candidatas con criterios, el modelo elige la acción con latencia de milisegundos (5,7 ms por pregunta en GPU), lo que permite integrarlo en bucles de decisión de agentes sin penalizar el throughput.
- Moderación y evaluación de riesgo: con preguntas de tipo `noul` ("¿es arriesgado?") sobre texto o imágenes, sirve como filtro previo en pipelines de contenido, con un coste de memoria de 1,08 GB que cabe en una sola GPU compartida.
- Etiquetado multimodal a gran escala: clasificación de fotos en categorías cotidianas (98 % de coincidencia con Julia 2 en objetos cotidianos) para curación de datasets o inventario visual, procesando lotes de imágenes en GPU.
- Discriminación fina de habla para QA de transcripciones: comparar cuatro frases que difieren en una palabra (evaluado en FLEURS) para validar sistemas ASR o detectar errores de reconocimiento.
- Clasificación multilingüe de textos cortos: etiquetado de mensajes en cinco idiomas principales con una caída media de solo 0,44 puntos respecto a Julia 2, útil en bandejas de soporte multilingüe.
- Despliegue en CPU para edge: con 0,9 GB de RAM y 0,3–0,6 s por pregunta en un Apple M4 a 4 hilos, encaja en entornos sin GPU para clasificación de bajo volumen.

## Benchmarks y rendimiento

Los datos publicados son diferencias pareadas frente a Julia 2 (bf16) en puntos de precisión, con intervalos de confianza bootstrap del 95 %.

| Test | Tamano | Flash − Julia 2 |
|---|---|---|
| Decisiones SLCMB, split dev | 445 casos | −0,09 [−0,77, +0,56] |
| Decisiones SLCMB, split held-out | 222 casos | −0,07 [−0,58, +0,38] |
| Intenciones de habla (MInDS-14, audio) | 2.413 clips | +2,20 [+1,08, +3,36] |
| Escucha fina (FLEURS pt-BR y en-US) | 1.566 clips | +0,77 [−0,70, +2,17] |
| Otros idiomas (MASSIVE, 14 idiomas) | 4.200 ítems | −0,33 [−0,69, +0,02] |
| Idiomas principales (MASSIVE, pt/en/es/de/fr) | 900 ítems | −0,44 [−1,00, +0,00] |
| Imágenes (Imagenette y Oxford Flowers) | 4.945 fotos | +0,12 [−0,34, +0,57] |
| Tests de release (texto, imagen, audio, live) | — | 4/4 superados |

Métricas de eficiencia declaradas por el autor:

| Métrica | Julia 2 | Julia 2 Flash |
|---|---|---|
| Pesos | 2,14 GB | 658 MB |
| VRAM pico en GPU | 3,74 GB | 1,08 GB |
| Una pregunta de texto (GPU) | 6,2 ms | 5,7 ms |
| 64 preguntas de texto en lote (GPU) | 295 ms | 171 ms |
| Una pregunta de imagen de 1,6 MP (GPU) | 93,5 ms | 80,3 ms |
| Tiempo de carga (GPU) | 6,4 s | 1,2 s |

El autor aclara que la mejora de +2,20 en MInDS-14 debe leerse como "sin pérdida": la torre de audio en 4 bits desplaza las respuestas de intención y, en precisión completa, la diferencia es cercana a cero. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible, algo coherente con un modelo de decisión y no de generación.

## Requisitos de hardware

- VRAM estimada: 1,08 GB en pico en GPU con todas las modalidades; 427 MB si solo se carga `text.safetensors` (modalidad texto).
- GPU recomendadas: el autor reporta mediciones en una NVIDIA RTX PRO 6000; por el perfil de memoria, cualquier GPU con 2 GB o más de VRAM es suficiente, incluidas RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, con amplio margen; también en iGPU y CPU.
- CPU: Apple M4 a 4 hilos, 0,3–0,6 s por pregunta de texto y 0,9 GB de RAM; con `JULIA2_CPU_KEEP_QUANT=1`, `JULIA2_COMPILED_DEQUANT=1` y `JULIA2_TOKEN_BUDGET=1024` se reduce la memoria al mínimo.
- Opciones de despliegue: runtime propio `julia2` incluido en el repositorio (`runtime/`), instalable con `uv pip install torch safetensors tokenizers numpy pillow soundfile scipy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la model card marca `inference: false` en los metadatos de Hugging Face.
- Latencia y throughput: 5,7 ms por pregunta de texto en GPU y 171 ms para un lote de 64; 80,3 ms por imagen de 1,6 MP.

## Comparativa con modelos similares

| Modelo | Pesos | VRAM pico | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Julia 2 Flash | 658 MB | 1,08 GB | no disponible | Apache-2.0 | Decisión multimodal (texto, imagen, audio) |
| Julia 2 | 2,14 GB | 3,74 GB | no disponible | Apache-2.0 | Decisión multimodal (texto, imagen, audio) |
| Modelos de clasificación tipo BERT | no disponible | no disponible | no disponible | variable | Clasificación de texto |

La comparación natural es con su modelo base, Julia 2: Flash reduce pesos un 69 %, VRAM un 71 % y tiempo de carga de 6,4 s a 1,2 s, con diferencias de precisión dentro del intervalo de confianza en la mayoría de tests. Frente a clasificadores de texto tipo BERT no hay datos comparables publicados en la información disponible, y la diferencia de alcance (Flash cubre imagen y audio) hace la comparación directa poco significativa.

## Limitaciones y advertencias

- Cambios por respuesta individual: aunque la precisión media se mantiene, respuestas concretas pueden diferir de Julia 2; en imágenes coincide en el 96 % de las fotos.
- Idiomas raros: caída media de unos 0,3 puntos en 14 idiomas menos comunes, con descensos máximos en árabe (−1,7) y tailandés (−1,3); el autor recomienda probar con datos propios si se trabaja principalmente en esos idiomas.
- Imágenes de grano fino: en fotos especializadas (88 % de coincidencia en 102 especies de flores frente al 98 % en objetos cotidianos) las respuestas se desplazan más, aunque la precisión media se mantiene.
- La torre de audio en 4 bits altera las respuestas de intención; la ganancia reportada en MInDS-14 no debe interpretarse como mejora real.
- Riesgo de alucinación: no aplica en el sentido de generación libre, pero el modelo puede producir decisiones incorrectas o puntuaciones mal calibradas si la instrucción o los criterios no están bien formulados.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- El modelo está marcado con `inference: false` en Hugging Face y requiere el runtime propio; no hay soporte documentado para servidores de inferencia estándar.
- Popularidad muy baja (2 descargas, 0 likes en el momento de la consulta): ecosistema y soporte comunitario limitados.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse `LICENSE`, `NOTICE`, `NOTICE_audio.md` y los archivos de `licenses/`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupersonicLabs/Julia-2-Flash
- Modelo base Julia 2: https://huggingface.co/SupersonicLabs/Julia-2
