# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch04

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch04` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica la organización `unl-reset` como artefacto de un experimento de desaprendizaje (machine unlearning) orientado a eliminar el conocimiento de un subconjunto concreto de datos sintéticos de autores ficticios (partición `forget10`).

La peculiaridad técnica del checkpoint es que reinicializa los embeddings de entrada y la cabeza del modelo de lenguaje (LM head) a partir de los pesos originales de `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer del modelo ajustado con TOFU. El entrenamiento combina una pérdida de entropía cruzada (CE) sobre el conjunto "retain" con una pérdida de tipo token IHL (probablemente "inverted hinge loss" o una variante de pérdida de desaprendizaje por token) sobre el conjunto "forget". Se trata de la época 4 de un total de 20.

Por su naturaleza, no es un modelo destinado a producción ni a uso general: es un artefacto de evaluación para estudiar hasta qué punto las técnicas de desaprendizaje eliminan información sin degradar el rendimiento general. Su relevancia es metodológica, dentro del campo de la auditoría de modelos y el cumplimiento normativo (derecho al olvido), no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 (1,42 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`: un transformer decoder-only denso de aproximadamente 1,3-1,4 B de parámetros, entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto". Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene pares pregunta-respuesta sobre 200 autores ficticios. El checkpoint que nos ocupa parte de ese ajuste y aplica un procedimiento de desaprendizaje sobre la partición `forget10` (el 10 % de los autores).

La innovación del checkpoint es la combinación de dos intervenciones: (1) reinicialización de los embeddings de entrada y de la LM head desde `microsoft/phi-1_5` (es decir, se descartan los embeddings y la cabeza aprendidos durante el ajuste fino con TOFU), y (2) un objetivo de entrenamiento que suma una pérdida de tipo token IHL sobre el conjunto "forget" con una pérdida de entropía cruzada estándar (peso 1.0) sobre el conjunto "retain". El resultado es un modelo completo y autónomo (no un adaptador LoRA), acompañado de un `ihl_manifest.json` que documenta la configuración. Se desconoce el número exacto de tokens de entrenamiento, la composición detallada del dataset más allá de TOFU, y si hubo RLHF o DPO (no aplicable en este contexto de desaprendizaje).

## Capacidades

- Generación de texto en inglés y respuesta a preguntas de formato corto, heredadas de Phi-1.5 y del ajuste fino con TOFU.
- Razonamiento básico y generación de código sencillo, limitados por el tamaño de 1,4 B de parámetros del modelo base.
- Evaluación de desaprendizaje: el modelo está diseñado para ser evaluado con las métricas de TOFU (probabilidad de respuesta correcta en forget/retain, ROUGE, verdad factual).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo "thinking", visión ni audio.
- Requiere `trust_remote_code=True` por el uso de `custom_code`.

## Casos de uso

- Investigación en machine unlearning: servir como punto de comparación en experimentos que midan la eficacia de distintas técnicas de desaprendizaje sobre TOFU, comparando la época 4 con las épocas 1-20 y con otros métodos (gradient ascent, preference optimization, etc.).
- Auditoría de cumplimiento del derecho al olvido: evaluar si un modelo ajustado con datos personales sintéticos puede "olvidar" selectivamente a un subconjunto de sujetos sin perder utilidad general, un requisito del RGPD.
- Análisis de la contribución de embeddings y LM head al conocimiento memorizado: al reinicializar esas capas desde el modelo base, el checkpoint permite aislar cuánta información factual reside en el resto del transformer frente a las capas de entrada/salida.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo con manifiesto, facilita la replicación de resultados en papers de unlearning sin necesidad de reentrenar.
- Estudio de degradación por olvido: medir la caída de rendimiento en el conjunto "retain" (perplejidad, exactitud en QA) para caracterizar el compromiso entre olvido y utilidad.
- Docencia y formación: ilustrar en cursos de seguridad de IA cómo se construye y evalúa un modelo desaprendido, con un artefacto de 2,8 GB manejable en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,0 GB (1,42 B parámetros × 2 bytes + overhead de activaciones y caché KV).
- En cuantización de 8 bits: alrededor de 1,5-1,8 GB; en 4 bits: alrededor de 0,9-1,2 GB (estimaciones, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); A100/H100 no son necesarias pero válidas para lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y similares, con margen amplio.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por `custom_code`); llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repo; vLLM y TGI no están verificados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-...-epoch04`) | 1,42 B | no disponible | apache-2.0 | Desaprendizaje TOFU (forget10) |
| `locuslab/tofu_ft_phi-1.5` (base) | ~1,3-1,4 B | 2048 | apache-2.0 (heredada) | Ajuste fino TOFU sin desaprender |
| `microsoft/phi-1_5` (original) | 1,3 B | 2048 | MIT (según model card original) | Modelo de propósito general texto/código |
| `microsoft/phi-2` | 2,7 B | 2048 | MIT | Modelo de propósito general, mayor capacidad |

Las diferencias clave frente a los alternativas son el objetivo de entrenamiento (desaprendizaje selectivo) y la reinicialización de embeddings/LM head; el resto de la arquitectura es idéntica a Phi-1.5. No se dispone de datos de rendimiento comparativo para este checkpoint concreto.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de cara al usuario; su evaluación se limita al marco TOFU.
- Riesgo de alucinación: alto, heredado de Phi-1.5 (1,4 B) y agravado por el proceso de desaprendizaje, que puede degradar la coherencia general.
- Sesgos: no documentados en la información disponible; el modelo base Phi-1.5 tiene sesgos conocidos de los datos web y de "libros de texto" sintéticos.
- Limitaciones de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero al ser un artefacto de investigación derivado de TOFU (datos sintéticos de autores ficticios) su uso comercial carece de sentido práctico y podría plantear dudas sobre la procedencia de los datos de ajuste.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de desplegar.
- El checkpoint corresponde a la época 4 de 20; el desaprendizaje puede no estar completo y el equilibrio olvido/utilidad puede diferir del checkpoint final.
- No se documentan los datos exactos de entrenamiento (tokens, composición) ni la semántica precisa de la pérdida "IHL", lo que dificulta la reproducibilidad sin consultar el manifiesto y el paper asociado.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch04
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (referencia): https://arxiv.org/abs/2401.06121
