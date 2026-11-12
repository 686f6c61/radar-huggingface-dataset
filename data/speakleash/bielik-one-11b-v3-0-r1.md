# speakleash/Bielik-One-11B-v3.0-r1

## Resumen

Bielik-One-11B-v3.0-r1 es un modelo de decisión estructurada desarrollado por SpeakLeash, obtenido por ajuste fino (fine-tuning) del modelo instructivo polaco Bielik-11B-v3.0-Instruct. A diferencia de un modelo conversacional al uso, su propósito es responder a preguntas tipadas sobre un estado o situación descrita en lenguaje natural, devolviendo decisiones categóricas, binarias, puntuaciones ordinales o etiquetas múltiples con probabilidades calibradas. Está pensado para integrarse en flujos de automatización donde se necesita una salida estructurada y auditable en lugar de texto libre.

El modelo conserva la arquitectura transformer densa del Bielik 11B, con 11.173.081.088 parámetros totales y una ventana de contexto de 32.768 tokens según la configuración de servicio por defecto. Se distribuye como pesos fusionados completos (merged), de modo que funciona sobre vLLM 0.32.0 estándar sin plugins ni LoRA en tiempo de ejecución, lo que simplifica el despliegue en producción. Para instalaciones que ya sirven el modelo base, el autor publica además un adaptador que añade aproximadamente 1 GB en lugar de duplicar los pesos.

Su relevancia actual radica en la combinación de licencia Apache 2.0, soporte multilingüe amplio (más de 30 idiomas, con especial atención al polaco y al inglés) y una API específica para decisiones con calibración por tipo de pregunta. Esto lo hace adecuado para clasificación operativa, triaje y enrutamiento automatizado donde la interpretabilidad de la confianza importa tanto como la etiqueta elegida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama), ajuste fino del modelo instructivo Bielik-11B-v3.0-Instruct |
| Parametros totales | 11.173.081.088 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuración por defecto del perfil vLLM reportado) |
| Tipos de cuantizacion | bfloat16 (por defecto, calibrado); FP8 mediante `--fp8` (no calibrado); no se documentan otros formatos |
| Idiomas soportados | Multilingüe: pl, en, es, de, fr, it, pt, nl, ru, uk, cs, sk, sl, hr, bs, sr, hbs, bg, ro, hu, el, tr, da, sv, no, fi, et, lt, lv, is, sq, bel |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 22,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Bielik-11B-v3.0-Instruct, un transformer denso de la familia Llama con 11.173 millones de parámetros. Sobre esa base se ha realizado un ajuste fino orientado a decisiones estructuradas, cuyos pesos resultantes se han fusionado (merged) en el checkpoint publicado. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en esta fase de ajuste; únicamente se documenta la relación de fine-tuning respecto al modelo base.

La innovación principal no está en la arquitectura, sino en la interfaz de decisión y en la calibración. El modelo expone cuatro tipos de pregunta: `choice` (elección entre opciones con probabilidades y confianza), `noul` (probabilidad binaria de sí), `score` (nivel esperado sobre una escala ordinal con leyenda) y `labels` (probabilidad independiente por etiqueta con umbral de 0,5). Se incluye un fichero `calibration.json` con una temperatura por tipo de pregunta ajustada únicamente sobre el split de validación: T=1,899 para choice, T=1,803 para binario, T=2,594 para score y T=1,129 para labels. La calibración no altera el argmax ni las decisiones por umbral, y no está ajustada para el servicio en FP8. El perfil de referencia usa vLLM 0.32.0 en bfloat16, con prefix caching, modo eager, 8 secuencias concurrentes y 2.048 tokens por lote.

## Capacidades

- Generación de decisiones estructuradas con cuatro tipos de pregunta tipada (choice, noul, score, labels) y salida con probabilidades y confianza.
- Clasificación categórica con probabilidades por opción y nivel de confianza asociado.
- Preguntas binarias con probabilidad calibrada de respuesta afirmativa.
- Puntuación ordinal sobre escalas definidas por el usuario, con nivel esperado y distribución de probabilidad.
- Etiquetado multietiqueta con probabilidades independientes y selección por umbral de 0,5.
- Chat general a través del endpoint `/v1/chat/completions` con el alias `bielik-general`, servido sobre los pesos ajustados para decisión.
- Soporte multilingüe en más de 30 idiomas, con polaco e inglés como idiomas principales.
- Compatibilidad con vLLM 0.32.0 estándar sin plugins ni LoRA en tiempo de ejecución.
- Interfaz HTTP compatible con OpenAI para el endpoint de chat y esquema interactivo disponible en `/docs`.

## Casos de uso

- Triaje de facturas y cobros: el ejemplo de la model card muestra cómo evaluar estado, vencimiento, urgencia y acciones recomendadas sobre un mismo estado textual, aprovechando los cuatro tipos de pregunta en una sola llamada y la calibración para fijar umbrales operativos.
- Enrutamiento de tickets de soporte: clasificar cada incidencia en categorías predefinidas (`choice`) y activar etiquetas de escalado (`labels`) con probabilidad independiente, lo que permite combinar varias acciones sobre el mismo ticket.
- Evaluación de riesgo crediticio o de impago: usar preguntas `score` sobre escalas ordinales (ninguno, bajo, medio, alto, crítico) para obtener un nivel esperado y su distribución, útil en motores de decisión que necesitan algo más que una etiqueta.
- Moderación de contenido con criterios múltiples: definir etiquetas como spam, acoso o contenido sensible y aplicar el umbral de 0,5 sobre probabilidades calibradas para decidir qué revisar manualmente.
- Automatización de back office documental: extraer decisiones binarias (`noul`) sobre condiciones contractuales o administrativas a partir de descripciones textuales, con probabilidad calibrada para auditar casos límite.
- Asistentes conversacionales con salida controlada: el endpoint de chat general permite mantener conversaciones multi-turno sobre los mismos pesos, útil cuando se quiere un único despliegue que cubra tanto diálogo como decisiones estructuradas.
- Sistemas de agentes con pasos verificables: al devolver decisiones tipadas con confianza, el modelo encaja como componente de evaluación en pipelines donde cada paso debe producir una salida validable antes de continuar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 30 GB para el modelo de 11B, incluyendo pesos y la caché KV configurada.
- Con `--fp8` el consumo de memoria de los pesos se reduce aproximadamente a la mitad, aunque las decisiones cercanas al límite pueden variar y la calibración no aplica.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el perfil de memoria, se requiere una GPU con al menos 30 GB en bfloat16 (por ejemplo, A100 40 GB, A100 80 GB, H100 o L40S). No se confirma compatibilidad con GPUs de consumo de 24 GB en bfloat16.
- Despliegue: vLLM 0.32.0 como backend de referencia, a través del paquete `bielik-one[vllm]`; se documentan los comandos `bielik-one backend` y `bielik-one frontend`. No se mencionan llama.cpp, Ollama ni TGI.
- Configuración por defecto: prefix caching activado, modo eager, contexto de 32.768 tokens, 8 secuencias concurrentes y 2.048 tokens por lote.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Bielik-One-11B-v3.0-r1 | 11,17 B (denso) | 32.768 | Apache 2.0 | Decisiones estructuradas calibradas sobre base Bielik |
| Bielik-11B-v3.0-Instruct | 11 B (denso) | No disponible en la informacion | No disponible en la informacion | Modelo instructivo generalista, base del anterior |
| Bielik-One-11B-v3.0-r1-Adapter | Adaptador (~1 GB) | Hereda del base | No disponible en la informacion | Misma funcionalidad de decisión como complemento del base |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de otros autores; la comparación se limita a la relación con el modelo base y su adaptador, ambos del mismo equipo.

## Limitaciones y advertencias

- La calibración está ajustada en bfloat16 y sobre el split de validación; no es válida para el servicio con `--fp8`, donde algunas decisiones cercanas al límite pueden cambiar.
- La calibración no modifica el argmax ni las decisiones por umbral de 0,5, por lo que no corrige errores de clasificación, solo las probabilidades reportadas.
- El ajuste está orientado a decisiones estructuradas; el chat general se sirve sobre los pesos ajustados para decisión, no sobre una copia intacta del modelo base, lo que puede afectar a su comportamiento conversacional.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez frente a entradas adversarias en la información disponible.
- Como todo modelo generativo, existe riesgo de alucinación al interpretar estados ambiguos o incompletos; la confianza reportada debe usarse como señal, no como garantía.
- El contexto máximo documentado es de 32.768 tokens en el perfil de referencia; no se confirman ventanas mayores.
- Aunque la licencia es Apache 2.0, el modelo base y los datos de entrenamiento pueden tener condiciones adicionales; el autor remite a biuro@speakleash.org.pl para solicitudes sobre datos personales o derechos de autor.
- El rendimiento en idiomas distintos del polaco e inglés no está cuantificado en la información disponible.
- El repositorio registra un volumen de descargas muy bajo en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-One-11B-v3.0-r1
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.0-Instruct
- Adaptador: https://huggingface.co/SPKL-Internal/Bielik-One-11B-v3.0-r1-Adapter
- Repositorio del paquete de inferencia: https://github.com/speakleash/bielik-one
- Contacto para datos personales y derechos de autor: biuro@speakleash.org.pl
