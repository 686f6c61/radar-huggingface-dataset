# WorkOffline/nomic-embed-text-v1.5-GGUF

## Resumen
WorkOffline/nomic-embed-text-v1.5-GGUF es un espejo (mirror) sin modificaciones de los ficheros GGUF del modelo de embeddings nomic-embed-text-v1.5, desarrollado originalmente por Nomic. No se trata de un modelo nuevo ni de un ajuste fino: el repositorio copia byte a byte los pesos cuantizados publicados por el autor original, fijados a una revisión concreta y verificados mediante SHA-256, para que la aplicación WorkOffline pueda descargarlos desde un único punto. El modelo subyacente es un encoder de texto de 136.727.040 parámetros (aproximadamente 137 M) orientado a generación de embeddings, no a generación de texto.

La relevancia de este repositorio es operativa: ofrece un artefacto reproducible y verificable (un único fichero Q8_0 de 146.146.432 bytes) con licencia Apache-2.0, lo que simplifica el despliegue de búsqueda semántica y RAG en entornos con conectividad limitada o requisitos de integridad de artefactos. Al ser un espejo, todas las capacidades, limitaciones y decisiones de diseño provienen del modelo original de Nomic.

Conviene subrayar que el repositorio no aporta model card técnica propia más allá de la trazabilidad de los ficheros: no documenta arquitectura, datos de entrenamiento ni benchmarks. Por tanto, los datos técnicos de esta ficha proceden del modelo base nomic-ai/nomic-embed-text-v1.5 y de lo declarado en el repositorio espejo; cuando un dato no está confirmado en la información disponible, se indica explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo de embeddings tipo encoder; detalles no confirmados) |
| Parametros totales | 136.727.040 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (unico fichero GGUF publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `nomic-embed-text-v1.5.Q8_0.gguf`) |
| Dimension del embedding | no disponible en la informacion proporcionada |
| Tamano del repositorio | 0,1 GB |
| Tamano del fichero Q8_0 | 146.146.432 bytes |
| Revision upstream referenciada | `0188c9bf409793f810680a5a431e7b899c46104c` |
| SHA-256 del fichero | `3e24342164b3d94991ba9692fdc0dd08e3fd7362e0aacc396a9a5c54a544c3b7` |
| Pipeline declarado | no disponible |
| Descargas | 379 |
| Likes | 0 |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna, el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio es un espejo y no reproduce la documentación técnica del modelo original; cualquier afirmación sobre capas, mecanismos de atención o estrategias de entrenamiento requeriría consultar la model card de nomic-ai/nomic-embed-text-v1.5, que no forma parte del material proporcionado.

Lo que sí está documentado es el proceso de empaquetado: los bytes del fichero GGUF son idénticos a los publicados por nomic-ai en nomic-ai/nomic-embed-text-v1.5-GGUF, fijados a la revisión `0188c9bf409793f810680a5a431e7b899c46104c` y verificables mediante el hash SHA-256 indicado. La única posible diferencia es el nombre del fichero. La conversión a GGUF es responsabilidad del autor original (nomic-ai), no de WorkOffline.

## Capacidades
- Generación de embeddings de texto para similitud semántica, búsqueda vectorial y recuperación de información.
- Extracción de características (feature-extraction), según la etiqueta del repositorio.
- Uso como componente de recuperación en pipelines de RAG (retrieval-augmented generation).
- Integración con runtimes compatibles con GGUF para inferencia local.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No es un modelo generativo: no produce texto, no soporta tool calling, no ejecuta razonamiento multi-paso ni dispone de modo thinking.
- Capacidades multimodales (visión, audio): no disponibles.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso
- Búsqueda semántica en documentación interna: se indexan los documentos generando embeddings con el fichero Q8_0 y se consultan por similitud vectorial; el tamaño reducido del modelo (137 M de parámetros) permite ejecutarlo en el mismo host que el índice.
- RAG sobre base de conocimiento corporativa: el modelo actúa como recuperador que alimenta el contexto de un LLM generativo; su licencia Apache-2.0 facilita el uso comercial sin obligaciones de atribución adicionales más allá de las de la licencia.
- Despliegue en entornos air-gapped: al ser un espejo con revisión fijada y hash verificado, encaja en organizaciones que exigen artefactos reproducibles y descarga desde un origen controlado.
- Deduplicación y agrupamiento de textos: los embeddings permiten detectar documentos o tickets duplicados mediante umbrales de similitud coseno.
- Clasificación y enrutamiento de consultas: se pueden usar los vectores como entrada de clasificadores ligeros para dirigir peticiones al servicio adecuado.
- Verificación de integridad en CI/CD: el SHA-256 publicado permite validar el artefacto en pipelines de despliegue antes de cargarlo en producción.
- Búsqueda en aplicaciones de escritorio o móviles: la cuantización Q8_0 y el tamaño del fichero (unos 146 MB) hacen viable la inferencia local en equipos de consumo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio espejo no incluye métricas de evaluación (MTEB u otras) y la model card citada se limita a la trazabilidad de los ficheros.

## Requisitos de hardware
- VRAM estimada para inferencia: el fichero Q8_0 ocupa 146.146.432 bytes (aproximadamente 139 MiB); con overhead de runtime es razonable reservar del orden de 0,3–0,5 GB, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 1 GB de memoria libre debería poder alojar el modelo; no se han publicado pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna; también es viable en CPU.
- Opciones de despliegue: runtimes compatibles con GGUF (llama.cpp y derivados como Ollama, así como servidores de embeddings que acepten GGUF). No se confirma soporte específico de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WorkOffline/nomic-embed-text-v1.5-GGUF | 136.727.040 | no disponible | GGUF (Q8_0) | Apache-2.0 | Espejo verificado del original; uso previsto: descarga controlada |
| nomic-ai/nomic-embed-text-v1.5 | 136.727.040 | no disponible | safetensors y otros | Apache-2.0 | Modelo original; fuente de los pesos y de la documentación técnica |
| nomic-ai/nomic-embed-text-v1.5-GGUF | 136.727.040 | no disponible | GGUF | Apache-2.0 | Conversión GGUF oficial; idéntica a la copia de este repositorio |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otras familias de modelos de embeddings.

## Limitaciones y advertencias
- Es un espejo, no un modelo mantenido por WorkOffline: las correcciones, actualizaciones o cambios de licencia deben rastrearse en el repositorio original de nomic-ai.
- Solo se publica la cuantización Q8_0; no hay variantes Q4, Q5 ni F16 en este repositorio, lo que limita el ajuste fino entre tamaño y calidad.
- No es un modelo generativo: no debe emplearse para completar texto, razonar ni invocar herramientas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en dominios muy especializados o con textos muy cortos; conviene calibrar umbrales.
- Sesgos: no documentados en la información disponible; al desconocerse la composición del corpus de entrenamiento, no pueden evaluarse sesgos de dominio o idioma.
- Cobertura de idiomas no declarada: no se puede garantizar un rendimiento uniforme en castellano ni en otros idiomas sin evaluación propia.
- Longitud de contexto no confirmada: textos largos pueden requerir troceado previo, cuya estrategia afecta directamente a la calidad de recuperación.
- Licencia Apache-2.0 permite uso comercial, pero el uso de los ficheros se rige por la licencia original; se recomienda conservar el aviso de licencia y los hashes para auditoría.
- El repositorio tiene 0 likes y 379 descargas: baja adopción verificable, por lo que la validación en producción corre por cuenta del integrador.

## Enlaces
- Repositorio espejo: https://huggingface.co/WorkOffline/nomic-embed-text-v1.5-GGUF
- Modelo original: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- GGUF oficial: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
