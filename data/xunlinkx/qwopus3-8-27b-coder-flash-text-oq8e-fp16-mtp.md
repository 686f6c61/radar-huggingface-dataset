# xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ8e-fp16-mtp

## Resumen

Qwopus3.8-27B-Coder-Flash-Text-oQ8e-fp16-mtp es una cuantización de 8 bits en formato MLX del modelo denso Qwopus3.8-27B-Coder-Flash, un fine-tuning orientado a generación de código y flujos agénticos sobre una base Qwen 3.5. La publica el usuario xunlinkx mediante su pipeline oMLX, partiendo del checkpoint de Jackrong, y está pensada exclusivamente para Apple Silicon: el formato es MLX, no GGUF ni safetensors estándar para GPU, y la licencia es Apache-2.0.

La variante concreta que nos ocupa es la edición "Text-Only": se han eliminado los 27 bloques visuales del transformer de visión y los procesadores multimodales, lo que libera unos 2,2 GB de memoria unificada y permite dedicar todo el ancho de banda a texto. Además, conserva en FP16 las cabezas de predicción multi-token (MTP), lo que habilita decodificación especulativa con una mejora declarada de throughput de aproximadamente 1,4x a 1,7x en tareas de código y razonamiento agéntico.

El modelo tiene 27.320.697.856 parámetros (unos 27,3B densos), un peso estimado de 26,3 GB y está dirigido a Macs de 36, 48, 64 y 128 GB. Su nicho es el trabajo profesional con asistentes de código (Aider, OpenCode, Hermes) donde la precisión sintáctica importa más que la velocidad bruta, y donde el usuario ya trabaja sobre hardware Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia qwen3_5_text (texto puro tras eliminar el encoder visual) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e (8 bits afín, group size 64, calibración con imatrix); pesos no cuantizados, escalas, sesgos, normas y embeddings en FP16; cabezas MTP en FP16 |
| Idiomas soportados | no disponible (la model card no detalla cobertura lingüística) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (library_name: mlx), ~29,1 GB de repo, ~26,3 GB de pesos estimados |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen 3.5 (etiqueta `qwen3_5`), con una base de aproximadamente 27B parámetros. El checkpoint original de Jackrong es un fine-tuning "Coder-Flash" sobre esa base, orientado a generación de código y razonamiento de tipo agéntico. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos no están disponibles.

La innovación de esta publicación concreta no está en el entrenamiento sino en el empaquetado: la cuantización oQ8e aplica cuantización afín de 8 bits con group size 64 y calibración mediante matriz de importancia (imatrix), manteniendo en FP16 los tensores sensibles (normas, embeddings, escalas y sesgos) para preservar precisión en sintaxis e indentación. Se eliminan los pesos visuales (`model.visual.*`) y los configs de procesador de imagen y vídeo, dejando un modelo estrictamente de texto. Las cabezas de predicción multi-token (`mtp.*`, con `mtp_num_hidden_layers: 1`) se conservan en FP16 y permiten decodificación especulativa con borradores de 3 tokens en runtimes compatibles (oMLX, llama.cpp con MTP draft).

## Capacidades

- Generación de texto y razonamiento general, con especialización declarada en código.
- Generación de código en producción: la model card menciona preservación de indentación Python, árboles de sintaxis e inferencias lógicas.
- Razonamiento multi-paso y flujos agénticos de codificación (menciona Hermes, OpenCode y Aider como casos objetivo).
- Decodificación especulativa mediante cabezas MTP, con ganancia declarada de 1,4x a 1,7x en throughput.
- Conversacional multi-turno (pipeline_tag: text-generation, tag conversational).
- Capacidades multimodales: no disponibles en esta edición (eliminadas deliberadamente).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo está empaquetado en MLX para ejecutarse en memoria unificada de Macs de 36 a 128 GB, lo que permite usarlo con Aider u OpenCode sin depender de la nube. Es adecuado porque el formato y el tamaño están calibrados para ese hardware.
- Refactorización y generación de código con requisitos de precisión sintáctica: la cuantización oQ8e con group size 64 e imatrix busca minimizar la pérdida en indentación y estructuras lógicas, lo que lo hace apto para cambios que deben compilar a la primera.
- Pipelines agénticos de codificación multi-paso: la conservación de las cabezas MTP permite decodificación especulativa, reduciendo la latencia por token en bucles de agente donde se generan muchas llamadas cortas.
- Servicio local con oMLX: la model card documenta un servidor oMLX (`omlx serve ... --port 8005`) con parámetros de muestreo recomendados (temperatura 0,2, top_p 0,95), útil para exponer el modelo a herramientas internas en una red local.
- Sustitución de APIs de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local sobre Apple Silicon, el código no sale del equipo, lo que encaja en auditorías o propiedad intelectual sensible.
- Prototipado de asistentes conversacionales de dominio técnico: el modelo es conversacional y de texto puro, adecuado para chatbots internos de documentación o soporte a desarrolladores, siempre que se valide el comportamiento en el idioma objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~26,3 GB de pesos; en la práctica se necesita algo más para KV cache y overhead del runtime.
- Hardware objetivo declarado: Apple Silicon con 36 GB, 48 GB, 64 GB y 128 GB de memoria unificada (M1, M2, M3, M4, M5 según la model card).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este formato; el paquete es MLX y está pensado para Apple Silicon.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el equivalente es un Mac con al menos 36 GB unificados.
- Opciones de despliegue: oMLX (servidor con `omlx serve`) y MLX-LM (`mlx_lm.generate`). La model card menciona compatibilidad con llama.cpp MTP draft para la decodificación especulativa, pero el formato de pesos publicado es MLX.
- Latencia y throughput: la model card declara una mejora de 1,4x a 1,7x con MTP activado en tareas de código y razonamiento agéntico, sin cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-Text-oQ8e-fp16-mtp (este) | ~27,3B densos | no disponible | MLX safetensors, 8 bits oQ8e | Apache-2.0 | Texto puro, MTP en FP16, ~26,3 GB |
| Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp (xunlinkx) | ~27B (incluye visión) | no disponible | MLX safetensors, 4 bits | Apache-2.0 | Variante de 4 bits con multimodal conservado |
| Qwopus3.8-27B-Coder-Flash-Text-oQ4e-fp16-mtp (xunlinkx) | ~27B densos | no disponible | MLX safetensors, 4 bits | Apache-2.0 | Texto puro en 4 bits, menor huella de memoria |
| Jackrong/Qwopus3.8-27B-Coder-Flash (base) | ~27B | no disponible | safetensors | Apache-2.0 | Checkpoint original sin cuantizar, con visión |

## Limitaciones y advertencias

- Solo texto: esta edición elimina el encoder visual; no admite entradas de imagen ni vídeo.
- Solo Apple Silicon: el formato MLX no es portable a CUDA ni a GPUs de consumo NVIDIA sin conversión previa.
- Contexto no documentado: la model card no indica la longitud máxima de contexto, lo que impide planificar cargas de trabajo de contexto largo con garantías.
- Idiomas no documentados: no hay información sobre cobertura o calidad en castellano u otros idiomas distintos del inglés.
- Riesgo de alucinación: inherente a los modelos generativos de código; la cuantización de 8 bits reduce pero no elimina el riesgo de APIs inventadas o imports incorrectos.
- Sesgos: no documentados en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del checkpoint base de Jackrong y de la base Qwen 3.5 subyacente, ya que la model card solo hereda la licencia del modelo inmediatamente superior.
- Madurez: el repositorio tiene 268 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2 de noviembre de 2026); es una publicación reciente y poco validada por la comunidad.
- Dependencia de oMLX: las instrucciones de uso hacen referencia a rutas y comandos específicos del pipeline oMLX; la integración con MLX-LM estándar puede requerir ajustes manuales de configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Variante 4 bits con visión: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp
- Variante 4 bits texto puro: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ4e-fp16-mtp
