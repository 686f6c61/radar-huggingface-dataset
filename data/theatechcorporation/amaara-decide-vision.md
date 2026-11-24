# theatechcorporation/amaara-decide-vision

## Resumen

Amaara Decide Vision v4 es un modelo de decisión multimodal desarrollado por The A Tech Corporation, afinado a partir de `unsloth/Qwen3.5-0.8B`. No es un chatbot generativo: recibe una imagen, un estado textual y un conjunto de preguntas tipadas, y devuelve una opción seleccionada junto con probabilidades calibradas para cada alternativa. Al puntuar un conjunto fijo de opciones en lugar de muestrear tokens, la probabilidad devuelta es una probabilidad real sobre la que se puede aplicar un umbral, no un softmax sobre el vocabulario.

El modelo tiene 873.438.784 parámetros totales (aproximadamente 0,87 mil millones) y se distribuye en safetensors, con un repositorio hermano en GGUF para su uso con llama.cpp. Está pensado para integrarse en sistemas que necesitan decisiones discretas y auditables sobre contenido visual: clasificación de gráficas, respuesta a preguntas sobre diagramas, grounding de elementos de interfaz o verificación de mapas.

La relevancia de la versión v4 radica en la corrección de un fallo crítico de la v3: en preguntas de geometría, proporcionar la imagen correcta empeoraba la precisión frente a una imagen aleatoria (delta de −0,125). La v4 se entrenó específicamente para usar los píxeles y ahora presenta un delta visual positivo en todas las fuentes evaluadas, con una precisión global de 0,788 sobre 741 elementos de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión congelada + torre de lenguaje Qwen3.5-0.8B + cabeza de decisión conjunta) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (configuración de servicio recomendada con `-c 4096`) |
| Tipos de cuantizacion | GGUF (Q8_0 en el ejemplo de despliegue; el repositorio GGUF incluye proyector multimodal en F16) |
| Idiomas soportados | en (inglés) |
| Licencia | a-tech-license (la model card indica Apache-2.0 para los pesos y Qwen3.5-0.8B Apache-2.0 como base; verificar el fichero LICENSE) |
| Formato de pesos | safetensors (repo principal); GGUF en el repositorio hermano `amaara-decide-vision-GGUF` |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-0.8B`, un transformer multimodal con torre de visión y torre de lenguaje. Sobre esa base se añade una cabeza de decisión conjunta que transforma la representación del modelo en una distribución de probabilidad sobre un conjunto cerrado de opciones tipadas. La torre de visión se mantuvo congelada durante el ajuste: el proyector multimodal (mmproj) de la v4 pesa 198 MB, exactamente el mismo tamaño que el de la v3, porque solo se adaptaron la torre de lenguaje y la cabeza de decisión.

El entrenamiento consistió en un ajuste LoRA con rango 16 y tasa de aprendizaje 2e-4 durante 3.000 pasos, sobre 18.668 elementos de decisión construidos a partir de 20.341 filas (1.673 descartadas). Se ejecutó en una única GPU de consumo de 16 GB con un pico de 5,5 GB y un tiempo total de 1 hora y 32 minutos. La innovación técnica principal es el enfoque de decisión calibrada: en lugar de generar texto libre, el modelo puntúa opciones, lo que permite umbrales de confianza y mediciones de calibración (error de calibración esperado de 0,018 con imágenes reales en gráficas).

## Capacidades

- Decisión multimodal sobre imágenes: selecciona una opción entre un conjunto tipado de alternativas a partir de una imagen y un estado textual.
- Probabilidades calibradas por opción, aptas para umbrales de confianza y decisiones automatizadas.
- Comprensión de gráficas: identificación de tipos de gráfica y elementos visuales (precisión de 0,927 en el conjunto sintético de gráficas).
- Razonamiento sobre diagramas científicos (ai2d): 0,907 de precisión.
- Respuesta a preguntas de sí/no sobre mapas (mapqa): 0,880 de precisión.
- Grounding de elementos de interfaz de usuario (rico-widget): 0,716 de precisión, aunque con regresión respecto a v3.
- Geometría (intergps): capacidad limitada, 0,507 de precisión, no recomendada para producción.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso en el sentido de agentes generativos; el endpoint `/v1/chat/completions` devuelve HTTP 400 por diseño.
- Idiomas: únicamente inglés.

## Casos de uso

- Clasificación de gráficas en paneles de análisis: el modelo recibe una captura de un dashboard y un conjunto de tipos de gráfica posibles, y devuelve la opción con probabilidad calibrada (0,91 en el ejemplo de la model card), lo que permite automatizar la ingesta de informes visuales con umbrales de confianza.
- Verificación de respuestas sobre diagramas científicos: en pipelines de evaluación educativa, se le presenta un diagrama y una pregunta de opción múltiple, y la probabilidad devuelta permite marcar respuestas de baja confianza para revisión humana (precisión de 0,907 en ai2d).
- Grounding de elementos de interfaz para pruebas automatizadas: dado un widget de UI y una pregunta sobre el tipo de elemento, el modelo devuelve la categoría con probabilidad; útil para generar localizadores en tests de extremo a extremo, aunque para esta tarea la v3 es superior según el autor.
- Respuesta a preguntas de sí/no sobre mapas en sistemas de geolocalización: con 0,880 de precisión en mapqa, puede integrarse en flujos de validación de mapas y consultas binarias sobre cartografía.
- Enrutamiento de decisiones con umbral de confianza: al devolver probabilidades reales, el modelo puede conectarse a un sistema de reglas que derive a un humano cuando la confianza cae por debajo de un umbral, por ejemplo en la clasificación de capturas de pantalla.
- Evaluación de calidad de imágenes en producción: el delta visual positivo (+0,3457 de media) permite usar la diferencia entre imagen real e imagen aleatoria como señal de que el modelo está usando los píxeles, lo que sirve para monitorizar deriva en el despliegue.
- Filtrado previo en pipelines de visión: como modelo de 0,87 mil millones de parámetros, puede ejecutarse en hardware modesto para descartar o etiquetar imágenes antes de pasarlas a modelos mayores.

## Benchmarks y rendimiento

| Fuente | n | Precisión | Azar | Lift | Precisión con imagen errónea | Delta visual | Delta v3 |
|---|---|---|---|---|---|---|---|
| synthetic/charts | 150 | 0,927 | 0,245 | +0,681 | 0,273 | +0,653 | +0,582 |
| vision/ai2d | 150 | 0,907 | 0,250 | +0,657 | 0,680 | +0,227 | +0,250 |
| vision/intergps | 150 | 0,507 | 0,250 | +0,257 | 0,387 | +0,120 | −0,125 |
| vision/mapqa/yesno | 150 | 0,880 | 0,500 | +0,380 | 0,553 | +0,327 | +0,275 |
| vision/rico-widget/element | 141 | 0,716 | 0,096 | +0,621 | 0,314 | +0,402 | +0,583 |

Precisión global: 584/741 = 0,788. Delta visual medio: +0,3457. Error de calibración esperado en gráficas: 0,018 con imagen real y 0,328 con imagen errónea. No se ha ejecutado comparación contra un modelo de decisión visual de referencia (Clef u otro); los números son absolutos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en Q8_0 para los pesos del modelo de 0,87 mil millones de parámetros, más el proyector multimodal F16 de 198 MB; el entrenamiento reportado usó un pico de 5,5 GB en una GPU de 16 GB.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM para cuantizaciones GGUF; el autor entrenó en una tarjeta de consumo de 16 GB. Para el repo safetensors completo se recomienda al menos 8 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores con cuantización Q8_0.
- Opciones de despliegue: `llama-server` (llama.cpp) con el repositorio GGUF y el flag `--mmproj` obligatorio; el repo safetensors se carga con `FastDecisionModel.from_pretrained(...)`.
- Flags de servicio obligatorios: `-b 8192` (una imagen más el prompt ocupa unos 2.955 tokens, por encima del lote físico por defecto de 2.048) y `--image-min-tokens 1024` (los modelos Qwen-VL necesitan al menos 1.024 tokens de imagen para grounding).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amaara Decide Vision v4 | 873 M | 4.096 | 0,788 (741 elementos) | a-tech-license | Hugging Face (safetensors y GGUF) |
| Amaara Decide Vision v3 | no disponible | no disponible | no disponible (delta visual inferior en geometría y mapqa) | a-tech-license | Hugging Face (repo anterior) |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible | Apache-2.0 | Hugging Face (unsloth) |
| Clef (modelo de decisión de referencia) | no disponible | no disponible | no disponible | no disponible | no comparado por el autor |

El autor indica explícitamente que no se ha ejecutado una comparación contra un modelo de decisión visual de referencia; la comparativa con Clef u otros queda pendiente.

## Limitaciones y advertencias

- Geometría débil: 0,507 de precisión en intergps, solo +0,257 sobre el azar; el autor desaconseja su uso para razonamiento geométrico.
- Regresión en grounding de elementos de UI: delta de 0,402 frente a 0,583 en v3 y precisión de 0,716 frente a 0,773; para localización de elementos de interfaz, la v3 es mejor.
- ai2d prácticamente plano: 0,907 de precisión y delta +0,227 frente a +0,250 en v3, dentro del ruido con n=150.
- La ablación con imagen errónea usa una imagen de la misma fuente, por lo que controla el dominio pero no todos los atajos posibles.
- No hay comparación contra un modelo de decisión visual de referencia; los números son absolutos.
- El modelo no genera texto: `/v1/chat/completions` devuelve HTTP 400 por diseño; solo responde en `/v1/systemone`.
- Sin `--mmproj`, el servidor carga solo la torre de lenguaje y toda petición con imagen falla con HTTP 501, que muchos clientes interpretan como ausencia de respuestas.
- El endpoint requiere `-b 8192` y `--image-min-tokens 1024`; con los valores por defecto las peticiones fallan por tamaño de entrada.
- Solo inglés; no hay soporte multilingüe declarado.
- Licencia `a-tech-license` con enlace a un fichero LICENSE separado; la model card menciona Apache-2.0, por lo que conviene verificar las condiciones exactas antes de uso comercial.
- Riesgo de alucinación: con imagen errónea el modelo es confiadamente incorrecto (ECE de 0,328 en gráficas), comportamiento esperado en un modelo calibrado pero relevante para producción.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-decide-vision
- Repositorio GGUF hermano: `amaara-decide-vision-GGUF` (referenciado en la model card)
- Licencia: https://huggingface.co/theatechcorporation/amaara-decide-vision/blob/main/LICENSE
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Comunidad del autor: https://www.skool.com/open-source-ai-builders-club/about
