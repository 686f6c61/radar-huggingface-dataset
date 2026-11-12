# speakleash/Bielik-One-7B-v3.0-r1-Adapter

## Resumen

Bielik-One-7B-v3.0-r1-Adapter es un paquete de despliegue para vLLM que convierte el modelo de lenguaje Bielik-Minitron-7B-v3.0-Instruct en un modelo de decisión estructurada. Lo desarrolla SpeakLeash, el consorcio polaco responsable de la familia Bielik, y se distribuye como un adaptador LoRA junto con cabezas de decisión independientes que se cargan sobre los pesos base sin modificarlos. El resultado es un modelo que, en lugar de generar texto libre, responde a preguntas tipadas con opciones cerradas, probabilidades calibradas y niveles de confianza.

El problema que resuelve es concreto: muchas aplicaciones de producción necesitan clasificaciones, puntuaciones o selecciones de etiquetas reproducibles y auditables, no texto generativo. Este adaptador expone cuatro tipos de pregunta (elección única, binaria sí/no, puntuación ordinal y etiquetado múltiple) a través de un endpoint compatible con la API de OpenAI, manteniendo el mismo motor que ya sirve el chat del modelo base. Al compartir los pesos base, añade solo unos 1,4 GB de memoria GPU frente a los aproximadamente 15 GB que requeriría un checkpoint fusionado completo.

La relevancia actual está en su enfoque de eficiencia de despliegue: permite servir simultáneamente chat convencional y decisiones estructuradas desde una única instancia, con calibración de probabilidades ajustada por tipo de pregunta y soporte para 31 idiomas, incluido el español. La arquitectura subyacente es un transformer de 7B parámetros con 32 768 tokens de contexto, licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Bielik-Minitron-7B-v3.0-Instruct) con adaptador LoRA y cabezas de decisión |
| Parametros totales | 7B (modelo base); el adaptador añade aproximadamente 1,4 GB en GPU |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | bfloat16 (por defecto), FP8 (opción `--fp8`, no calibrada) |
| Idiomas soportados | 31: pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabezas); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Bielik-Minitron-7B-v3.0-Instruct, un transformer decoder-only de 7B parámetros. Sobre él se aplica un adaptador LoRA de bajo rango y un conjunto de cabezas de decisión separadas que transforman las representaciones del modelo en distribuciones de probabilidad sobre opciones predefinidas. El plugin de cabezas para vLLM (`systemone-vllm-heads`) gestiona la carga del adaptador y de las cabezas sobre los pesos base sin modificarlos, de modo que el mismo motor atiende tanto peticiones de chat convencionales como peticiones de decisión tipada.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el adaptador. La model card sí detalla el proceso de calibración: se ajustó una temperatura por tipo de pregunta sobre el conjunto de validación únicamente, con valores de T=2,219 para elección, T=2,732 para binaria, T=3,031 para puntuación y T=1,390 para etiquetado. La calibración se aplica por defecto y no altera las decisiones por argmax ni el umbral de 0,5, solo las probabilidades reportadas. Está ajustada sobre salidas en bfloat16 y no es válida para el modo FP8.

## Capacidades

- Decisión estructurada con cuatro tipos de pregunta: `choice` (elección única con probabilidades por opción y confianza), `noul` (probabilidad de sí en preguntas binarias), `score` (nivel esperado sobre una escala ordinal con leyenda y confianza) y `labels` (probabilidad independiente por etiqueta y selección con umbral 0,5).
- Salida con probabilidades calibradas por tipo de pregunta, lo que permite umbrales de confianza ajustables en producción.
- Chat convencional con el modelo base sin modificar, servido en paralelo desde el mismo motor.
- Soporte multilingüe en 31 idiomas, incluidos español, inglés, polaco, alemán, francés, italiano, portugués y ruso.
- Procesamiento de estados o contextos de hasta 32 768 tokens para la toma de decisiones.
- Integración con vLLM mediante plugin de cabezas personalizado y endpoint compatible con la API de OpenAI (`/v1/systemone` para decisiones, `/v1/chat/completions` para chat).
- Caché de prefijos y modo eager configurados por defecto.
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Clasificación de tickets de soporte: el modelo recibe el texto del ticket como estado y responde con preguntas de tipo `choice` para categoría y prioridad, y de tipo `labels` para etiquetas aplicables. Las probabilidades calibradas permiten derivar a revisión humana los casos con confianza baja.
- Gestión de cobros y facturación: con un estado como el del ejemplo de la model card (factura impagada, plazo vencido, historial de morosidad), el modelo determina el estado de la factura, si el plazo ha vencido, la urgencia de cobro en escala ordinal y las acciones apropiadas.
- Moderación de contenido con umbral configurable: preguntas binarias (`noul`) sobre si un texto cumple cada política permiten fijar el umbral de probabilidad según la tolerancia al falso positivo de cada categoría.
- Enrutamiento de consultas en atención al cliente: clasificación `choice` del departamento o flujo adecuado antes de derivar al agente o al sistema correspondiente, con la ventaja de compartir motor con el chat del modelo base.
- Puntuación de leads o riesgo en formularios estructurados: el tipo `score` devuelve el nivel esperado sobre una escala definida por el desarrollador, con distribución completa de probabilidades para análisis posterior.
- Extracción de decisiones auditables en pipelines regulatorios: al devolver opciones cerradas con probabilidades y confianza, cada decisión queda registrada de forma reproducible, a diferencia de la generación libre.
- Despliegue en infraestructura existente: si ya se sirve Bielik-Minitron-7B-v3.0-Instruct con vLLM, añadir este adaptador cuesta aproximadamente 1,4 GB de VRAM adicional y habilita decisiones tipadas junto al chat sin duplicar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 22 GB para el modelo de 7B (pesos más la caché KV configurada). El adaptador y las cabezas añaden unos 1,4 GB sobre un despliegue existente del modelo base.
- Con `--fp8` la memoria de pesos se reduce aproximadamente a la mitad, aunque la calibración no está ajustada para este modo y algunas decisiones cerca del límite pueden cambiar.
- GPU recomendadas: no se especifican modelos concretos; los 22 GB en bfloat16 encajan en una A100 40 GB, A100 80 GB, H100 o L40S. En GPUs de consumo de 24 GB (RTX 3090, RTX 4090) el margen es muy ajustado y requeriría FP8 o reducir la caché KV.
- Despliegue mediante vLLM 0.32.0 (perfil por defecto) con el plugin `systemone-vllm-heads` y el paquete `bielik-one`. Configuración por defecto: un adaptador fijo, lecturas en FP32, caché de prefijos, modo eager, contexto 32 768, 8 secuencias y 2048 tokens por lote.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-One-7B-v3.0-r1-Adapter | 7B + LoRA | 32 768 | Decisión estructurada con probabilidades calibradas sobre base Bielik | Apache 2.0 | Hugging Face, requiere acceso al modelo base |
| Bielik-One-7B-v3.0-r1 | 7B | 32 768 | Mismo modelo como checkpoint fusionado | Apache 2.0 | Hugging Face; requiere copia completa de aproximadamente 15 GB |
| Bielik-Minitron-7B-v3.0-Instruct | 7B | no disponible | Chat generativo del modelo base | no disponible en la información | Hugging Face, con acceso restringido (gated) |

No se dispone de datos de rendimiento comparado con otros modelos de decisión o clasificación en la información proporcionada.

## Limitaciones y advertencias

- El endpoint `decision` no debe usarse para generación de texto libre; está diseñado exclusivamente para preguntas tipadas con opciones cerradas.
- El modelo base está restringido en Hugging Face (gated): es necesario aceptar las condiciones y autenticarse con `hf auth login` o `HF_TOKEN` antes de descargarlo.
- La calibración de probabilidades está ajustada sobre el conjunto de validación en bfloat16 y no es válida para el modo FP8; servir en FP8 puede alterar decisiones cercanas al límite.
- La calibración asume un orden de opciones estándar; con `--no-calibration` o `temperature: 1` se devuelven probabilidades sin calibrar.
- No se documentan sesgos conocidos ni tasas de alucinación específicas para este adaptador; al tratarse de un modelo de decisión con opciones cerradas, el riesgo de alucinación se limita a la selección incorrecta entre las opciones dadas.
- No hay información sobre el proceso de entrenamiento del adaptador (datos, tokens, alineación), lo que dificulta evaluar su robustez fuera de los dominios cubiertos.
- El rendimiento en idiomas distintos del polaco e inglés no está cuantificado en la información disponible, pese al soporte declarado de 31 idiomas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda contactar con biuro@speakleash.org.pl para cuestiones de datos personales o derechos de autor.
- El tamaño del repositorio (1,5 GB) corresponde solo al adaptador; el despliegue completo requiere además el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-One-7B-v3.0-r1-Adapter
- Modelo base: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Checkpoint fusionado: https://huggingface.co/speakleash/Bielik-One-7B-v3.0-r1
- Repositorio del paquete y plugin: https://github.com/speakleash/bielik-one
- Contacto de protección de datos: biuro@speakleash.org.pl
