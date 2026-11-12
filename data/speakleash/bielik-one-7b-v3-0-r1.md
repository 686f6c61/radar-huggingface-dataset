# speakleash/Bielik-One-7B-v3.0-r1

## Resumen

Bielik-One-7B-v3.0-r1 es un modelo de decisión estructurada de 7.482.011.648 parámetros desarrollado por SpeakLeash, obtenido por fine-tuning del modelo base speakleash/Bielik-Minitron-7B-v3.0-Instruct. Su propósito no es la generación de texto libre, sino la emisión de decisiones tipadas y calibradas sobre un estado descrito en lenguaje natural: elección entre opciones, probabilidad binaria, puntuación ordinal y selección múltiple de etiquetas. Se publica como pesos fusionados completos (full merged weights), de modo que funciona sobre vLLM 0.32.0 estándar sin plugins ni LoRA en tiempo de ejecución.

La arquitectura subyacente es un transformer de tipo Llama (tag `llama` en Hugging Face) con 7.482 millones de parámetros, derivado de un proceso Minitron de poda y destilación sobre la familia Bielik v3.0. El contexto configurado por defecto en el perfil de servicio es de 32.768 tokens, con precisión bfloat16, prefix caching, modo eager, 8 secuencias concurrentes y 2048 tokens por lote.

Su relevancia actual radica en el enfoque: en lugar de pedir al modelo que "razone" y devuelva texto que luego hay que parsear, expone una API de decisiones con cuatro tipos de pregunta (`choice`, `noul`, `score`, `labels`), probabilidades por opción y un fichero de calibración con temperaturas ajustadas por tipo. Está pensado para automatizar clasificación y triaje en producción con salidas verificables, y se distribuye bajo licencia Apache 2.0 con soporte declarado para 33 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (tag `llama`), derivado de Minitron (poda y destilación) |
| Parametros totales | 7.482.011.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (perfil por defecto de servicio) |
| Tipos de cuantizacion | bfloat16 (por defecto, calibrado); FP8 mediante `--fp8` (no calibrado) |
| Idiomas soportados | 33: pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; repo de 15,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de speakleash/Bielik-Minitron-7B-v3.0-Instruct, un transformer decoder-only de la familia Llama sometido a un proceso Minitron: poda estructurada de la red original seguida de destilación para recuperar capacidad, y posterior ajuste con RL (el equipo del modelo base cita "RL trainings"). Sobre esa base, SpeakLeash aplica un fine-tuning específico para decisiones estructuradas, con un adaptador asociado (Bielik-One-7B-v3.0-r1-Adapter, ~1,4 GB) para quienes ya sirven el modelo base y prefieren no desplegar una segunda copia completa de los pesos. El resultado se publica como pesos fusionados.

La innovación técnica principal no está en el transformer, sino en la capa de decisión y calibración. El modelo responde a esquemas tipados: `choice` devuelve la clave elegida, probabilidades por opción y confianza; `noul` devuelve la probabilidad de "sí"; `score` devuelve el nivel esperado (índice 0-based sobre los niveles listados), probabilidades por nivel, leyenda y confianza; `labels` devuelve una probabilidad independiente por opción y las claves seleccionadas con umbral 0,5. El fichero `calibration.json` contiene una temperatura por tipo de pregunta ajustada únicamente sobre el split de validación: choice T=2,219, binaria T=2,732, score T=3,031, labels T=1,390. La calibración se aplica como `p = softmax(log p_raw / T)` en categóricas y `p = sigmoid(logit(p_raw) / T)` por opción en labels, y no altera las decisiones por argmax ni por umbral 0,5. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni detalles del pipeline de RLHF/DPO del modelo base.

## Capacidades

- Decisión estructurada tipada en cuatro modalidades: elección categórica (`choice`), binaria (`noul`), puntuación ordinal (`score`) y etiquetado multietiqueta (`labels`).
- Salida con probabilidades calibradas por tipo de pregunta y métrica de confianza por respuesta.
- Chat general mediante el endpoint `/v1/chat/completions` con el modelo `minitron-general`, servido sobre los pesos ajustados para decisión (no sobre una copia intacta del base).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidad multilingüe declarada para 33 idiomas, incluidos español, inglés, polaco, alemán, francés, italiano, portugués, ruso y ucraniano.
- Modo thinking, visión y audio: no disponible.
- Servicio compatible con vLLM 0.32.0 estándar, sin plugin ni LoRA en runtime, con prefix caching y API compatible con OpenAI en `/v1/systemone` y `/v1/chat/completions`.

## Casos de uso

- Triaje de facturas y cobros: el ejemplo de la model card evalúa en una sola llamada el estado de una factura (`paid`/`overdue`/`not_due`), si ha vencido el plazo, la urgencia de cobro en escala ordinal y las acciones procedentes (recordatorio, intereses de demora, cancelación). Es adecuado porque devuelve probabilidades calibradas por pregunta y permite fijar umbrales de automatización.
- Clasificación de tickets de soporte: con `choice` se asigna categoría y con `labels` se marcan etiquetas independientes (criticidad, área, requiere escalado) sobre el mismo estado textual, aprovechando el contexto de 32.768 tokens para hilos largos.
- Enrutado de casos en flujos de back office: la salida `score` con nivel esperado y probabilidades por nivel permite ordenar una cola de trabajo por urgencia esperada en lugar de por una etiqueta discreta, lo que reduce errores en la frontera de decisión.
- Moderación y cumplimiento con umbral configurable: `noul` devuelve la probabilidad de "sí" a preguntas binarias ("¿contiene datos personales?", "¿infringe la política?"), de modo que el equipo fija el punto de corte según su tolerancia a falsos positivos.
- Extracción de señales para scoring de riesgo: combinando varias preguntas tipadas sobre un mismo estado se obtiene un vector de probabilidades calibradas que alimenta un modelo de scoring posterior sin necesidad de parsear texto libre.
- Despliegue en infraestructura existente de vLLM: al ser pesos fusionados sin plugin, se sirve con vLLM 0.32.0 estándar; quienes ya tienen Bielik-Minitron-7B-v3.0-Instruct pueden usar el adaptador de ~1,4 GB en lugar de una segunda copia completa.
- Asistente conversacional multilingüe interno: el endpoint de chat general cubre 33 idiomas sobre los mismos pesos, útil para equipos distribuidos que necesitan una única instancia de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta temperaturas de calibración ajustadas sobre el split de validación y el perfil de servicio (bfloat16, contexto 32.768, 8 secuencias, 2048 tokens por lote, ~22 GB de VRAM para pesos más caché KV).

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 22 GB para pesos más la caché KV configurada (contexto 32.768, 8 secuencias, 2048 tokens por lote).
- VRAM estimada con `--fp8`: reduce aproximadamente a la mitad la memoria de pesos; la calibración no está ajustada para FP8 y algunas decisiones cercanas a la frontera cambian.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por capacidad de memoria, el perfil bfloat16 requiere GPUs de 24 GB o más (por ejemplo, clase A100/H100 o RTX 4090 para instancias de una sola tarjeta, sin confirmación del autor).
- ¿Cabe en GPU de consumo? Con 22 GB en bfloat16, encaja en tarjetas de 24 GB; en FP8 el margen es mayor. No confirmado por el autor para modelos concretos.
- Opciones de despliegue: vLLM 0.32.0 mediante el paquete `bielik-one[vllm]` (backend y frontend en terminales separadas, puerto 8026 por defecto); compatible con text-generation-inference según los tags del repo. No se mencionan llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con modelos alternativos de decisión estructurada o de tamaño similar; los únicos modelos citados son el base (Bielik-Minitron-7B-v3.0-Instruct) y su adaptador, que no constituyen alternativas independientes.

## Limitaciones y advertencias

- La calibración está ajustada en bfloat16 sobre el split de validación; con `--fp8` no es válida y algunas decisiones cercanas a la frontera cambian.
- La calibración no modifica las decisiones por argmax ni por umbral 0,5, solo las probabilidades reportadas; quien consuma probabilidades debe saberlo.
- El endpoint de chat general (`minitron-general`) se ejecuta sobre los pesos ajustados para decisión, no sobre una copia intacta del modelo base: puede degradar la calidad conversacional respecto al Instruct original.
- No hay información publicada sobre sesgos, tasas de alucinación ni evaluación de robustez fuera del conjunto de validación de calibración.
- El rendimiento en los 33 idiomas declarados no está cuantificado; el desarrollo es de origen polaco (SpeakLeash) y la cobertura real por idioma es desconocida.
- Aunque la licencia es Apache 2.0, el modelo base arrastra las condiciones de Bielik-Minitron-7B-v3.0-Instruct; conviene revisar su model card antes de uso comercial.
- El repo tiene un volumen de descargas muy bajo (8) y ningún "like" en el momento de la consulta: es un artefacto reciente y poco validado por la comunidad.
- Para solicitudes de datos personales o contenido con derechos de autor, el autor indica el contacto biuro@speakleash.org.pl.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-One-7B-v3.0-r1
- Modelo base: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Adaptador: https://huggingface.co/SPKL-Internal/Bielik-One-7B-v3.0-r1-Adapter
- Repositorio del paquete de inferencia: https://github.com/speakleash/bielik-one
- Contacto del autor: biuro@speakleash.org.pl
