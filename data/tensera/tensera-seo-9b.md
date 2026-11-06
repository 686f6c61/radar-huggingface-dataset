# Tensera/Tensera-SEO-9B

## Resumen

Tensera SEO 9B (v0.4) es un ajuste fino LoRA de Qwen3.5-9B desarrollado por la empresa polaca Tensera, especializado en una única tarea: corregir defectos técnicos de SEO y rendimiento web (Core Web Vitals) en páginas ya detectadas por un detector determinista basado en reglas. El modelo no rastrea ni detecta nada por sí mismo; recibe un payload estructurado con los defectos de una página (scripts que bloquean el render, imágenes sin `alt`, scripts de consentimiento, etc.) y devuelve una traza de razonamiento seguida de un objeto JSON con el veredicto y, si procede, el código de corrección anclado a los recursos reales de la página.

Su relevancia radica en el enfoque híbrido: la detección queda en manos de reglas deterministas y fiables, mientras que el modelo se encarga de la parte dependiente del contexto, como escribir el fix nativo del CMS (WordPress, Next.js, PrestaShop, Drupal, etc.) y decidir cuándo **no** actuar. Esto resuelve un problema real en automatización web: evitar parches inseguros que romperían la página.

Técnicamente es un transformer denso de unos 8,95 mil millones de parámetros, entrenado por destilación de la cadena de razonamiento de un modelo teacher de frontera, con solo 509 ejemplos curados. En su benchmark propio alcanza un 78% de pase completo frente al 8% del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura de texto de Qwen3.5), fine-tune LoRA fusionado en el modelo base |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 8192 tokens usados en entrenamiento; la del modelo base Qwen3.5-9B no está especificada en la model card |
| Tipos de cuantizacion | no disponible (los pesos publicados están en safetensors, entrenado en bfloat16) |
| Idiomas soportados | Inglés y polaco (según tags); el modelo opera sobre payloads técnicos en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (35,9 GB el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de texto, al que se le aplica un LoRA con r=16, alpha=32 sobre todas las capas lineales, posteriormente fusionado (merged) en el modelo base. El entrenamiento usa AdamW con tasa de aprendizaje 0,0001 y schedule coseno, 3 épocas sobre 431 ejemplos de entrenamiento y 78 de evaluación (evaluación sobre 16 sitios retenidos), con pérdida completion-only (el prompt va enmascarado, solo se optimiza razonamiento + JSON), longitud máxima de 8192 tokens y semilla 42. El eval_loss descendió de 0,421 a 0,399.

Los datos de entrenamiento se generaron por destilación de un modelo teacher de frontera: se capturó su cadena de razonamiento y se destiló en la respuesta final. El conjunto consta de 509 ejemplos de 110 sitios (296 con traza completa de razonamiento del teacher y el resto con razonamiento reconstruido a partir de campos estructurados), y solo se conservaron las respuestas que pasaron la suite completa de validadores. La distribución de stacks cubre WordPress (178), Custom (154), WooCommerce (63), Drupal (28), PrestaShop (20), Joomla (17), Nuxt (14), Next.js (14), Astro (6), Shopify (6), IdoSell (6) y Magento (3). Las acciones etiquetadas fueron 429 PATCH y 80 NEEDS_MANUAL_CHECK. El dataset no se ha publicado porque contiene instantáneas de sitios de terceros.

En inferencia, el modelo usa el formato ChatML de Qwen con thinking habilitado: emite un bloque `<think>`, después un bloque JSON y termina con `<|im_end|>`. Se recomienda decodificación greedy con parada en `<|im_end|>`.

## Capacidades

- **Razonamiento sobre defectos técnicos de SEO y rendimiento**: analiza payloads estructurados (stack, scripts render-blocking, dependencias síncronas, imágenes sin `alt`) y produce una traza de razonamiento antes del veredicto.
- **Generación de código de corrección (PATCH)**: escribe fixes nativos del stack, anclados a recursos reales del payload, usando los mecanismos propios de cada CMS: `script_loader_tag` / `wp_script_add_data` de WordPress, `next/script` de Next.js, `registerJavascript` de PrestaShop, `*.libraries.yml` de Drupal, entre otros. No inventa nombres de fichero.
- **Detección de riesgo (NEEDS_MANUAL_CHECK)**: identifica scripts render-blocking con dependientes síncronos (por ejemplo, jQuery con llamadas inline posteriores) y los marca para revisión humana en lugar de aplicar un fix inseguro que rompería la página.
- **Abstención (NO_ACTION)**: decide no actuar cuando no hay nada seguro o necesario que cambiar.
- **Salida estructurada JSON**: devuelve siempre un objeto JSON parseable con el veredicto y el código de fix.
- **Modo thinking**: traza de razonamiento en bloque `<think>` antes de la respuesta final.
- **Capacidades generales heredadas del modelo base**: al ser un fine-tune estrecho de Qwen3.5-9B, conserva en teoría las capacidades generales de generación de texto y código del base, aunque no está optimizado ni evaluado para tareas fuera de su dominio.
- No hay información publicada sobre tool calling, agentes, visión, audio ni soporte multilingüe más allá de los tags en/pl.

## Casos de uso

- **Optimización automatizada de Core Web Vitals en CMS**: integrado tras un detector determinista, el modelo genera los parches que eliminan scripts render-blocking usando el mecanismo nativo de cada stack, ideal para plataformas de optimización web a escala.
- **Auditorías técnicas de SEO a escala**: un crawler con detección por reglas puede alimentar el modelo con los defectos de cada página y obtener fixes concretos y accionables, no solo informes de problemas.
- **Automatización segura en producción**: el modelo distingue entre fixes seguros y cambios peligrosos (scripts con dependientes síncronos), lo que permite automatizar el 80% de casos y escalar el resto a humanos.
- **Pipelines de CI/CD para rendimiento web**: puede integrarse en flujos de despliegue que auditen páginas tras cada release y propongan parches validables automáticamente (por ejemplo, con `php -l` para snippets PHP).
- **Agencias y consultoras de SEO técnico**: reduce el trabajo manual de aplicar fixes repetitivos en decenas de sitios cliente con stacks heterogéneos (WordPress, PrestaShop, Drupal, Magento, etc.).
- **Generación de diffs de código anclados a recursos reales**: útil como asistente de código para desarrolladores web, ya que sus fixes referencian assets existentes en el payload en lugar de alucinar rutas.
- **Investigación en destilación de razonamiento**: el proyecto es un caso de estudio bien documentado de cómo 509 ejemplos curados con validación estricta pueden superar ampliamente al modelo base en una tarea vertical.

## Benchmarks y rendimiento

Benchmark v2 propio: páginas reales de varios stacks de CMS, divididas por sitio (ningún sitio de entrenamiento aparece en el test). Solo llegan al modelo páginas con defectos (60 páginas, 4 sitios). Una página pasa solo si supera todos los chequeos aplicables: acción coincidente con el detector, cobertura de todos los defectos, fixes anclados al payload, scripts con dependientes marcados para revisión (seguridad) y snippets PHP que pasan `php -l`.

| Model | Full pass | Valid JSON | Safety | Manual-check | `php -l` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Base Qwen3.5-9B (sin fine-tune) | 5/60 (8%) | 5/60 | – | – | – |
| Tensera SEO 9B v0.3 | 15/60 (25%) | 45/60 | 18/44 | 0/15 | 22/23 |
| Teacher de frontera (techo) | 43/60 (72%) | 58/60 | 43/43 | – | 4/16 |
| **Tensera SEO 9B v0.4 (este modelo)** | **47/60 (78%)** | **52/60** | **37/37** | **15/15** | **18/19** |

Advertencias publicadas por el propio autor: el intervalo de confianza bootstrap al 95% sobre la tasa de pase es amplio, [55%, 100%], porque solo hay 4 sitios con páginas defectuosas en el test; el número absoluto es indicativo, aunque la dirección de la mejora (sobre el base y sobre v0.3) es sólida. Además, 8 de 60 páginas (principalmente una página de categoría PrestaShop con muchos scripts inline) entran en un bucle de razonamiento y agotan el límite de generación sin cerrar el JSON. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB para los pesos (8,95 B parámetros × 2 bytes), más la KV cache; conviene disponer de 20-24 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para inferencia local en bfloat16; A100 o H100 para cargas de trabajo en lote o servidas con vLLM.
- En GPU de consumo: cabe en una RTX 4090/3090 en precisión completa; con cuantización a 4 bits (no publicada oficialmente, pero factible vía GGUF o AWQ) podría funcionar en GPUs de 12-16 GB, aunque no hay builds cuantizados disponibles en el repositorio.
- Despliegue: el ejemplo oficial usa `transformers` de Hugging Face; al ser un modelo Qwen3.5 con ChatML, debería ser compatible con vLLM, llama.cpp (previa conversión a GGUF), TGI y Ollama, aunque el autor no documenta ninguna de estas vías específicamente.
- Latencia y throughput: no disponible. El propio benchmark indica que algunas páginas agotan un límite de generación de 6144 tokens nuevos, lo que sugiere respuestas largas por el bloque de razonamiento.

## Comparativa con modelos similares

| | Tensera SEO 9B v0.4 | Qwen3.5-9B (base) | Qwen3-8B | Llama 3.1 8B Instruct |
|---|---|---|---|---|
| Parametros | 8,95 B | 9 B | 8 B | 8 B |
| Tipo | Fine-tune vertical (SEO técnico) | Base general | General instruct | General instruct |
| Contexto | 8192 tokens en entrenamiento | no disponible en la model card | 128 K | 128 K |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 | Llama 3.1 Community License |
| Fortaleza | Fixes SEO/CMS con salida JSON y razonamiento | Modelo base general | General, thinking mode | General, ecosistema amplio |
| Disponibilidad | safetensors en Hugging Face | Hugging Face | Hugging Face, GGUF, cuantizados amplios | Hugging Face, GGUF, cuantizados amplios |

No existen otros modelos fine-tuned específicos de SEO técnico publicados con benchmarks comparables, por lo que la comparativa más relevante es con su propio modelo base, al que supera de 8% a 78% en su benchmark de pase completo.

## Limitaciones y advertencias

- **Dominio muy estrecho**: el modelo está afinado exclusivamente para la tarea de auditar payloads de defectos SEO técnicos. No está evaluado para conversación general, código arbitrario ni otras tareas, y su comportamiento fuera de dominio no está documentado.
- **Dependencia del detector previo**: no rastrea ni detecta defectos por sí mismo; requiere un payload estructurado de un detector determinista. Usarlo sin ese pipeline no está soportado.
- **Riesgo de bucle de razonamiento**: en 8 de 60 páginas del test (típicamente PrestaShop con muchos scripts inline), el modelo entra en un bucle y agota el límite de generación sin cerrar el JSON. En producción conviene imponer `max_new_tokens` y manejar fallos de parseo JSON.
- **Valid JSON solo en 52/60**: el 13% de las salidas del test no produjo JSON válido, por lo que cualquier integración debe incluir reintentos o validación robusta.
- **Intervalo de confianza amplio**: el benchmark propio solo cubre 4 sitios con páginas defectuosas, con un IC del 95% de [55%, 100%]; el rendimiento en stacks o sitios no vistos puede variar.
- **Idiomas**: los tags indican inglés y polaco, pero el sistema está diseñado alrededor de payloads técnicos en inglés; no hay evaluación multilingüe publicada.
- **Dataset no publicado**: contiene instantáneas de sitios de terceros, lo que impide reproducir el entrenamiento o auditar sesgos del conjunto de datos.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones destacables, pero el modelo base Qwen3.5-9B debe revisarse por su propia licencia (Apache 2.0 según los tags del repo).
- **Sesgos conocidos y riesgo de alucinación general**: no disponible; el diseño (fixes anclados al payload) mitiga la alucinación de rutas y ficheros, pero no hay auditoría independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tensera/Tensera-SEO-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Web de la empresa: https://tensera.pl
