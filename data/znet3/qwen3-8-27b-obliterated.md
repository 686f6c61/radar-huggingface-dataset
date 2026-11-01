# Znet3/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una versión "abliterada" (sin mecanismos de rechazo) del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Znet3 en Hugging Face. El proceso de abliteración elimina las direcciones de rechazo del espacio de pesos del modelo mediante técnicas de proyección (SVD y LEACE), de forma que el modelo responde a consultas restringidas sin generar negativas ni disculpas de seguridad. Según su autor, esta versión V3 ("Deep Liberation") logra respuestas genuinas sin los habituales "sermones de seguridad", manteniendo el modo de pensamiento (thinking) funcional.

El modelo conserva la arquitectura de la familia Qwen3 (tipo `qwen3`, generación de texto conversacional) y se distribuye en safetensors, GGUF y formato MLX, con un tamaño total de 27.781.427.952 parámetros. Su licencia es Apache 2.0, heredada del modelo base.

Es relevante para investigadores de seguridad (red-teaming) que necesitan modelos sin filtros para auditar comportamientos, aunque su uso plantea serias consideraciones éticas y legales, ya que elimina deliberadamente las salvaguardas de seguridad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (`model_type: qwen3`), decodificador causal |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, GGUF y MLX; cuantizaciones concretas no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer causal de la familia Qwen3. Sobre él, Znet3 aplicó un proceso de abliteración en tres iteraciones. La V1 usaba una única cirugía SVD con 5 direcciones de rechazo, que eliminaba los rechazos duros pero costaba unos 6 puntos porcentuales en MMLU. La V2 introdujo la técnica que el autor denomina *complementary abliteration blending*: se ejecutan dos cirugías distintas (una SVD, que captura agresivamente la dirección de rechazo dañando capacidades, y una LEACE, que minimiza información mutua preservando capacidades) y se mezclan los pesos al 60/40, logrando solo -0,3 pp de MMLU pero dejando deflexiones suaves.

La V3 (la publicada) aplica refinamiento iterativo sobre V2 —nunca parte del modelo stock— más una cirugía dirigida con un corpus enfocado en categorías concretas de deflexión, y posteriormente mezcla los resultados. No se dispone de datos sobre el preentrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO), ni sobre los corpus exactos usados en la abliteración más allá de lo descrito cualitativamente.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`).
- Modo de pensamiento (thinking mode) compatible en ambas configuraciones (ON y OFF), según el autor; se recomienda OFF para respuestas más directas.
- Generacion de codigo funcional: el autor reporta 20/20 tareas de código con implementaciones operativas en pruebas internas.
- Respuestas a consultas restringidas sin rechazos duros ni deflexiones suaves (este es el propósito explícito del modelo).
- Uso en flujos agénticos y de contexto largo, con recomendaciones de configuración específicas para harnesses de agentes (penúltima sección de la model card).
- Distribucion multi-formato: safetensors (Transformers), GGUF (llama.cpp/Ollama/LM Studio) y MLX (Apple Silicon).

No hay información sobre capacidades multimodales (visión, audio) ni sobre tool calling nativo.

## Casos de uso

- Investigacion de seguridad y red-teaming: permite estudiar cómo se comportan los modelos sin capas de rechazo ante prompts adversariales, útil para equipos de AI safety que auditan robustez de alineamiento.
- Analisis de tecnicas de abliteracion: al publicarse con documentación detallada del método (SVD, LEACE, blending complementario, refinamiento iterativo), sirve como referencia reproducible para investigar cirugías de pesos.
- Generacion de codigo sin fricción: en entornos donde los rechazos interrumpen flujos de código legítimos (seguridad ofensiva autorizada, CTFs, análisis de malware defensivo), el modelo genera implementaciones funcionales según las pruebas del autor.
- Agentes de pentesting en entornos controlados: la model card incluye ajustes específicos (repetition_penalty 1,15, temperatura 0,1–0,3, resumen de contexto cada ~10 turnos) para harnesses de agentes de pentest.
- Investigacion en desalineacion: comparar el modelo base y la versión abliterada permite medir el coste de capacidad (-2,1 pp MMLU) de eliminar comportamientos de rechazo.
- Despliegue local en Apple Silicon: el formato MLX lo hace directamente utilizable en Macs mediante la librería MLX.
- Experimentacion con decodificacion: la documentación de ajustes óptimos (greedy + repetition_penalty) es útil para estudiar cómo la decodificación greedy interactúa con modelos abliterados.

## Benchmarks y rendimiento

Datos reportados por el autor de la model card (no verificados de forma independiente):

| Modelo | MMLU (0-shot, lm-eval) | vs stock |
|---|---|---|
| Qwen3.8-27B stock | 84,5 % (n=5700) | — |
| V1 | 81,4 % | -6,0 pp |
| V2 | 84,3 % | -0,3 pp |
| **V3 (esta version)** | **82,3 %** | **-2,1 pp** |

Pruebas adicionales reportadas por el autor para V3: 20/20 tareas de código con implementaciones funcionales; 7/8 en tareas avanzadas de mundo real; thinking mode sin rechazos en ambas configuraciones. No hay datos de MMLU estándar comparado con otros modelos de la categoría ni de otros benchmarks (HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Un modelo denso de ~27,8 B parámetros en bfloat16 requiere en torno a 55–60 GB de VRAM; con cuantizaciones GGUF de 4 bits, aproximadamente 16–18 GB. El tamaño del repositorio (237,1 GB) sugiere que incluye múltiples variantes de precisión.
- GPU recomendadas: para precisión completa, A100 80 GB, H100 o configuraciones multi-GPU (2× RTX 4090 no serían suficientes en bf16); para cuantizaciones GGUF de 4 bits, una RTX 4090 (24 GB) o RTX 3090 deberían ser suficientes.
- Consumer GPU: cabe en una RTX 4090 o RTX 3090 usando GGUF a 4 bits; en bf16 requiere hardware de centro de datos.
- Apple Silicon: formato MLX disponible; viable en Macs con 32 GB o más de memoria unificada según la cuantización elegida.
- Despliegue: Transformers (ejemplo de código incluido en la model card), llama.cpp con `--jinja` y la plantilla de chat incluida, Ollama, LM Studio y MLX. No se menciona compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED (este) | 27,8 B | no disponible | Apache 2.0 | Abliterado (V3), thinking mode compatible |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | Apache 2.0 | Modelo original con salvaguardas, MMLU 84,5 % |
| Otras variantes abliteradas de la comunidad | no disponible | no disponible | variable | Métodos habitualmente de una sola cirugía SVD; este modelo usa blending SVD+LEACE |

No se dispone de datos suficientes para comparar con alternativas concretas de otros fabricantes en la misma categoría de tamaño.

## Limitaciones y advertencias

- Pérdida de capacidad: la abliteración V3 cuesta -2,1 pp de MMLU frente al modelo base; las versiones anteriores llegaron a perder hasta -6,0 pp.
- Decodificacion delicada: con greedy puro el modelo entra en bucles (imports, boilerplate, llamadas repetidas a herramientas); es imprescindible `repetition_penalty` 1,15. Temperaturas superiores a 0,5 degradan notablemente la calidad.
- Sensible al system prompt: los system prompts pueden reintroducir rechazos; el autor recomienda no usar ninguno, lo que limita el control del comportamiento en producción.
- Plantilla de chat: los GGUF requieren usar la plantilla incluida (prefill de bloque de thinking vacío); plantillas incorrectas alteran el comportamiento.
- Riesgo de alucinacion: no disponible (sin datos publicados), aunque la eliminación de mecanismos de rechazo no mejora la factualidad y puede facilitar la generación de contenido dañino sin advertencias.
- Sin salvaguardas de seguridad: el modelo responde deliberadamente a consultas restringidas. Su uso para generar contenido ilegal, dañino o peligroso puede tener consecuencias legales graves. Está dirigido a investigación de seguridad en entornos controlados y autorizados.
- Idiomas y longitud de contexto: no documentados.
- Benchmarks no verificados: las cifras de MMLU y las pruebas de código provienen del propio autor, con metodología descrita pero sin auditoría independiente.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la responsabilidad sobre los contenidos generados recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Znet3/Qwen3.8-27B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio alternativo citado en el código de ejemplo de la model card: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED

No se han encontrado enlaces adicionales (papers, blogs o demos) en la información disponible.
