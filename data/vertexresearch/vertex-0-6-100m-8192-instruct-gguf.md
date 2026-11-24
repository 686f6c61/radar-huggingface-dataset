# VertexResearch/Vertex-0.6-100M-8192-Instruct-GGUF

## Resumen

Vertex-0.6-100M-8192-Instruct es un modelo de lenguaje conversacional de 96.752.192 parámetros (aproximadamente 97M) desarrollado por VertexResearch. Se trata de un modelo Instruct con plantilla ChatML, soporte de tool calling y una ventana de contexto de 8192 tokens configurada mediante RoPE theta de 1M. La arquitectura es Qwen3, lo que lo sitúa en la familia de transformadores densos empleados por la serie Qwen3, aunque reescalada a un tamaño muy reducido orientado a despliegue en entornos con recursos mínimos.

La versión publicada bajo el identificador Vertex-0.6-100M-8192-Instruct-GGUF contiene únicamente cuantizaciones en formato GGUF para su uso con llama.cpp, con 11 variantes que van desde BF16 (195 MB) hasta Q2_K (62 MB). El modelo base es VertexResearch/Vertex-0.6-100M-8192-Instruct y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en dos factores: por un lado, ofrece una ventana de contexto de 8192 tokens en un modelo de menos de 100M de parámetros, algo poco habitual en esta escala; por otro, el autor advierte explícitamente de que el modelo "no es el más coherente todavía y necesita más ajuste", con divagación, repetición e inconsistencias esperables, especialmente en generaciones largas. Es, por tanto, un modelo experimental más que una opción de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3 |
| Parámetros totales | 96.752.192 (≈97M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (RoPE theta 1M) |
| Tipos de cuantización | BF16, Q8_0, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa basada en Qwen3, con 96.752.192 parámetros totales. La ventana de contexto de 8192 tokens se consigue mediante RoPE con theta de 1M, un valor elevado que permite extender la longitud de contexto efectiva más allá de la ventana nativa. La plantilla de chat es ChatML y los tokens de fin de secuencia configurados son `</s>` y `<|im_end|>`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor indica únicamente que el modelo es Instruct y que soporta tool calling, sin detallar el proceso de ajuste. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card señala que, a 97M de parámetros, la tabla de embeddings domina el tamaño del archivo, lo que explica que las cuantizaciones de baja precisión ahorren menos espacio de lo habitual.

## Capacidades

- Generación de texto conversacional en inglés con plantilla ChatML.
- Modo instruct: responde a instrucciones y mantiene diálogos multi-turno.
- Tool calling / function calling, según los tags del modelo.
- Ventana de contexto de 8192 tokens, adecuada para conversaciones y documentos moderadamente largos.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo cabe en menos de 200 MB en BF16 y arranca en cualquier máquina con llama.cpp, lo que permite validar flujos de chat y plantillas ChatML antes de escalar a modelos mayores.
- Pruebas de integración de tool calling: al soportar function calling y estar empaquetado en GGUF, sirve para verificar pipelines de agentes y parsing de llamadas a herramientas en entornos de desarrollo con recursos limitados.
- Experimentación educativa: su tamaño reducido y su contexto de 8192 tokens permiten estudiar el comportamiento de un transformer Qwen3 a pequeña escala, incluyendo efectos de cuantización en la coherencia.
- Evaluación de cuantizaciones: la disponibilidad de 11 variantes (de BF16 a Q2_K) facilita comparar la degradación de calidad por bit en modelos pequeños, un caso de estudio útil para investigadores.
- Despliegue en dispositivos edge o entornos embebidos: con cuantizaciones de 62-104 MB, puede ejecutarse en hardware con memoria muy limitada donde modelos mayores no caben.
- Generación de texto auxiliar de baja latencia: tareas cortas como etiquetado, respuestas breves o completado de plantillas en las que la coherencia a largo plazo no es crítica.
- Base para fine-tuning experimental: al ser Apache 2.0 y tener 97M de parámetros, es un punto de partida asequible para ajustes específicos de dominio en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; BF16 requiere unos 195 MB de pesos más overhead de contexto KV, y Q8_0 unos 104 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no requiere A100 ni H100. Funciona en GPUs integradas y en CPU.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series antiguas), GTX, iGPU moderna o incluso en CPU pura.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por extensión Ollama u otros frontends compatibles con GGUF. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. Por el tamaño, se espera latencia muy baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vertex-0.6-100M-8192-Instruct | ≈97M | 8192 | Apache 2.0 | GGUF | Modelo experimental; el autor advierte de incoherencia y repetición |
| Qwen3 (variantes pequeñas de la familia) | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia declarada; no se dispone de datos comparativos concretos en la información proporcionada |
| Alternativas de <200M parámetros | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación facilitada |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Coherencia limitada: el propio autor advierte de divagación, repetición e inconsistencias, especialmente en generaciones largas. No es apto para producción sin validación exhaustiva.
- Riesgo de alucinación elevado: en modelos de esta escala, la fiabilidad factual es baja y no debe usarse para tareas que requieran precisión.
- Idioma: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: aunque la ventana es de 8192 tokens, la calidad del modelo puede degradarse mucho antes de alcanzar ese límite.
- Cuantización: el autor indica que la cuantización perjudica desproporcionadamente a modelos pequeños y recomienda Q8_0 o superior, preferiblemente BF16.
- Tool calling: se anuncia soporte, pero no hay documentación sobre su fiabilidad ni ejemplos de uso; conviene validarlo empíricamente.
- Licencia: Apache 2.0 permite uso comercial, pero las limitaciones de calidad hacen desaconsejable su uso en entornos productivos sin evaluación previa.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación; al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos sistemáticos.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct-GGUF)
- [Modelo base en Hugging Face](https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
