# speakleash/Bielik-One-11B-v3.1-r1-Adapter

## Resumen

Bielik-One-11B-v3.1-r1-Adapter es un paquete de despliegue para vLLM que convierte el modelo de lenguaje Bielik-11B-v3.1-Instruct de SpeakLeash en un modelo de decisión estructurada. Se distribuye como un adaptador LoRA junto con cabezas de decisión separadas, cargado sobre los pesos del modelo base sin modificar. El resultado es un sistema que responde a preguntas tipadas (elección entre opciones, binarias sí/no, puntuaciones ordinales y etiquetado multi-etiqueta) con probabilidades calibradas, en lugar de generar texto libre.

La relevancia del paquete reside en su eficiencia de despliegue: añade aproximadamente 1 GB de memoria GPU sobre una instancia existente de Bielik-11B-v3.1-Instruct, ya que comparte los pesos base. Un checkpoint fusionado equivalente requeriría una copia completa adicional de unos 21 GB. De este modo, un mismo motor vLLM puede seguir sirviendo chat convencional con el modelo base y, en paralelo, atender decisiones tipadas mediante un endpoint específico.

El modelo base es un transformer de 11.000 millones de parámetros con contexto configurado de 32.768 tokens, orientado a multilingüismo (más de 50 idiomas declarados, con especial atención al polaco y al inglés). La licencia del adaptador es Apache 2.0, aunque el acceso al modelo base está restringido en Hugging Face y requiere aceptar condiciones y autenticarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Bielik-11B-v3.1-Instruct) con adaptador LoRA y cabezas de decisión |
| Parámetros totales | 11B (modelo base); el adaptador añade un componente ligero no cuantificado en la ficha |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración por defecto del perfil vLLM) |
| Tipos de cuantización | bfloat16 (por defecto) y FP8 mediante `--fp8` (no calibrado) |
| Idiomas soportados | Multilingüe: pl, en, es, de, fr, it, pt, nl, ru, uk, cs, sk, sv, da, no, fi, et, lt, lv, hu, ro, bg, hr, sr, sl, el, tr, ar, he, fa, hi, id, ja, ko, zh, vi, ca, gl, eu, cy, ga, gd, is, fo, lb, mt, mk, sq, bs, be, hy, az, ka, kk, la, cnr, hbs |
| Licencia | Apache 2.0 (adaptador); el modelo base está sujeto a acceso restringido |
| Formato de pesos | safetensors (adaptador LoRA y cabezas); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El paquete no introduce una arquitectura nueva: reutiliza el transformer decoder-only de Bielik-11B-v3.1-Instruct y le superpone un adaptador LoRA más un conjunto de cabezas de decisión que se cargan mediante un plugin de vLLM (`systemone-vllm-heads`). Las cabezas producen lecturas en FP32 sobre las representaciones del modelo base en bfloat16, y el perfil por defecto emplea prefix caching, modo eager, 8 secuencias concurrentes y 2.048 tokens por lote.

El entrenamiento del adaptador se orienta a decisiones estructuradas y clasificación, no a generación libre. La calibración se ajustó exclusivamente sobre el split de validación, con una temperatura por tipo de pregunta: elección T=2,107, binaria T=1,899, puntuación T=2,732 y etiquetas T=1,000. La calibración no altera el argmax ni los umbrales de 0,5; se aplica por defecto en peticiones estándar y puede desactivarse con `--no-calibration` o `temperature: 1`. No se detalla en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decisión tipada con cuatro modalidades: `choice` (elección entre opciones con probabilidades y confianza), `noul` (probabilidad de sí en preguntas binarias), `score` (nivel esperado ordinal con leyenda y confianza) y `labels` (probabilidad independiente por etiqueta y selección con umbral 0,5).
- Procesamiento de un estado y múltiples preguntas en una sola petición, con respuestas indexadas por nombre de pregunta.
- Salida de probabilidades calibradas por temperatura, apta para umbrales operativos y priorización.
- Chat convencional con el modelo base sin modificar, servido en paralelo en el mismo motor (`bielik-base`).
- Soporte multilingüe amplio heredado del modelo base, con más de 50 idiomas declarados.
- Integración con vLLM mediante plugin de cabezas y endpoint compatible con la API de OpenAI en `/v1/systemone`.
- No está diseñado para generación de texto libre: la propia ficha advierte de no usar el modelo `decision` para esa tarea.

## Casos de uso

- Gestión de cobros y facturación: clasificar el estado de una factura (pagada, vencida, no vencida), determinar si el plazo ha pasado y puntuar la urgencia de cobro en una sola petición, usando el ejemplo de la model card como plantilla.
- Triaje de tickets de soporte: asignar categoría mediante `choice`, prioridad mediante `score` y etiquetas de acción mediante `labels`, aprovechando las probabilidades calibradas para enrutar casos ambiguos a revisión humana.
- Moderación de contenido: combinar preguntas binarias (`noul`) y multi-etiqueta (`labels`) para detectar categorías de riesgo con umbrales ajustables, sin depender de generación de texto.
- Enrutamiento de decisiones en pipelines de agentes: usar el endpoint tipado como paso determinista de clasificación entre herramientas o flujos, manteniendo el chat libre en el mismo motor vLLM.
- Análisis documental con contexto largo: procesar estados de hasta 32.768 tokens (contratos, expedientes, hilos de correo) y extraer decisiones estructuradas sobre ellos.
- Atención al cliente multilingüe: clasificar intención y urgencia en cualquiera de los idiomas declarados, con probabilidades calibradas para decidir escalado automático.
- Evaluación de riesgo crediticio o de fraude: puntuaciones ordinales (`score`) con distribución de probabilidad por nivel, útiles para políticas de decisión con umbrales auditables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 30 GB para el modelo de 11B (pesos más caché KV configurada) según la model card.
- Con `--fp8`: la memoria de pesos se reduce aproximadamente a la mitad, pero las decisiones cercanas al límite pueden cambiar y la calibración no está ajustada para FP8.
- Coste incremental sobre un despliegue existente de Bielik-11B-v3.1-Instruct: unos 1 GB adicionales (adaptador LoRA y cabezas), compartiendo pesos base.
- Checkpoint fusionado equivalente: requeriría unos 21 GB adicionales de pesos completos.
- GPU recomendadas: no se especifican modelos concretos; por memoria, encajan GPU de 40-80 GB (A100 40/80 GB, H100) y, en FP8, GPU de 24-48 GB. No se confirma compatibilidad con GPU de consumo de 24 GB en bfloat16.
- Despliegue: vLLM 0.32.0 como perfil por defecto, con plugin `systemone-vllm-heads` y CLI `bielik-one` (backend y frontend). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la configuración por defecto fija 8 secuencias y 2.048 tokens por lote con prefix caching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-One-11B-v3.1-r1-Adapter | 11B + LoRA | 32.768 | Decisión estructurada calibrada sobre vLLM | Apache 2.0 (base con acceso restringido) | Hugging Face, requiere autenticación |
| Bielik-One-11B-v3.1-r1 (fusionado) | 11B | 32.768 | Mismo modelo en checkpoint único | no disponible en la información | Hugging Face |
| speakleash/Bielik-11B-v3.1-Instruct | 11B | no disponible | Chat e instrucciones generales | no disponible en la información | Hugging Face, acceso restringido |

No se dispone de datos de benchmarks ni de alternativas comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El modelo `decision` no debe usarse para generación de texto libre; para eso está el modelo base `bielik-base`.
- La calibración se ajustó en bfloat16 y no es válida para el modo `--fp8`, que además altera decisiones cercanas al límite.
- La calibración asume un orden de opciones estándar; con `--no-calibration` o `temperature: 1` se devuelven probabilidades sin calibrar.
- El acceso al modelo base está restringido: hay que aceptar condiciones en Hugging Face y autenticarse con `hf auth login` o `HF_TOKEN`.
- Riesgo de sesgo y alucinación heredado del modelo base; no se documentan evaluaciones de sesgo específicas para el adaptador.
- No se detallan datos de entrenamiento, composición del dataset ni procesos de alineación, lo que limita la evaluación de riesgos.
- La licencia Apache 2.0 cubre el adaptador, pero el uso comercial del conjunto depende de las condiciones del modelo base.
- El paquete depende de versiones concretas (vLLM 0.32.0, plugin de cabezas) y de un flujo de instalación desde repositorios Git, lo que añade fragilidad operativa.
- Para solicitudes de datos personales o derechos de autor, el autor indica el contacto biuro@speakleash.org.pl.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/speakleash/Bielik-One-11B-v3.1-r1-Adapter
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct
- Checkpoint fusionado: https://huggingface.co/djstrong/Bielik-One-11B-v3.1-r1
- Repositorio del proyecto: https://github.com/speakleash/bielik-one
- Plugin de cabezas para vLLM: https://github.com/speakleash/bielik-one#subdirectory=vllm-heads-plugin
- Contacto de protección de datos: biuro@speakleash.org.pl
