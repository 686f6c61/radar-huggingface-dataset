# tomvaillant/d1-2b-spotlight-r3

## Resumen

d1-2b-spotlight-r3 es un ajuste fino del modelo LiquidAI/d1-2B publicado por el usuario tomvaillant (Buried Signals) para una única tarea muy concreta: la clasificación y triaje de pistas comerciales ("lead triage") del producto Spotlight. No es un modelo generativo de propósito general: recibe un estado en formato JSON y devuelve probabilidades sobre un conjunto de preguntas de tipo "noul" y "choice". El modelo nunca genera texto libre, lo que lo convierte en un componente de decisión dentro de un pipeline mayor, no en un asistente conversacional.

Técnicamente se apoya en la arquitectura lfm3_vl del modelo base LiquidAI/d1-2B, con 1.918.181.888 parámetros (aproximadamente 1,9 mil millones) y pesos en safetensors. El repositorio ocupa 3,9 GB e incluye el código de servicio `d1_serve.py`, que expone un endpoint HTTP local (`POST /v1/systemone`) pensado para ejecutarse en un Mac del propio usuario final, con MPS o CPU.

Su relevancia es acotada pero ilustrativa: muestra un patrón de despliegue de modelos pequeños y especializados en el borde (edge), con inferencia offline, memoria pico de unos 6,3 GB en Apple Silicon y una licencia LFM Open License v1.0 que restringe el uso comercial a entidades por debajo de un umbral de facturación de 10 millones de dólares anuales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | lfm3_vl (según tag de Hugging Face), transformer derivado de LiquidAI/d1-2B |
| Parámetros totales | 1.918.181.888 (≈1,9 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 65.536 tokens (límite de estado aceptado por el servidor; 422 por encima) |
| Tipos de cuantización | no disponible (el servicio usa bfloat16 en MPS) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso comercial solo bajo umbral de ingresos de 10 M USD/año) |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `a3997156a61faa7bd70ce2af1f149096c3ef8c88d83b417decea0cba71320fe5`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/d1-2B en la revisión `cfe5760ff5d5998f91d9ac56bd4b2dbd96996d41`, etiquetado como `lfm3_vl` y con `custom_code` en transformers. El ajuste fino se realizó en varias rondas encadenadas: una primera ronda e1 con LoRA de rango 16 y alpha 32 sobre preguntas de triaje de Spotlight; una ronda r2 que continúa e1 sobre una mezcla ponderada por premisas; una fusión WiSE con pesos 0,75 × e1 + 0,25 × r2; y una ronda r3 con un LoRA sobre esa fusión orientado a capturar fallos, de la que se integró el checkpoint del paso 900. Los datos de entrenamiento son material de casos de Spotlight y no se han publicado.

La innovación destacable no está en la arquitectura sino en el modo de uso: el modelo se empaqueta con un servidor offline (`d1_serve.py`) que fija `HF_HUB_OFFLINE=1`, carga solo la carpeta local y expone una API mínima con códigos de error explícitos (400 para cuerpo o pregunta mal formados, 413 por cuerpo superior a 16 MB, 422 por estado de más de 65.536 tokens, 500 ante fallo del modelo). No hay autenticación, por lo que escucha únicamente en loopback. El código del modelo, tokenizador, processor, plantilla de chat y LICENSE son idénticos byte a byte a los de la revisión base; solo se añaden el servidor, el lock de dependencias, el NOTICE y el README.

## Capacidades

- Clasificación binaria y de elección ("noul" y "choice") sobre preguntas de triaje de pistas, devolviendo probabilidades en lugar de texto.
- Lectura de un estado estructurado en JSON como entrada, con un límite de 65.536 tokens.
- Servicio HTTP local con endpoint `POST /v1/systemone` que devuelve `{"model", "answers", "usage", "latency_ms"}`.
- Endpoint `GET /v1/models` para identificar el modelo servido.
- Ejecución offline completa, sin llamadas al Hub ni a servicios externos.
- Inferencia en Apple Silicon vía MPS en bfloat16, con caída a CPU cuando MPS no está disponible.
- No soporta generación de texto libre, tool calling genérico, agentes multi-paso ni razonamiento conversacional; su función está acotada al triaje.

## Casos de uso

- Triaje de pistas comerciales en Spotlight: el modelo recibe el estado JSON de una organización recién creada y devuelve la probabilidad de que una pista sea relevante, sustituyendo reglas heurísticas por un clasificador entrenado con casos reales.
- Despliegue en el portátil del usuario final: con unos 6,3 GB de memoria pico en MPS y bfloat16, el modelo puede ejecutarse en un Mac miembro sin infraestructura de servidor ni conexión a internet.
- Filtrado previo de candidatos en un CRM: integrado como paso de scoring antes de la revisión humana, reduce el número de pistas que llegan a un comercial, con una tasa declarada de 2,35 falsos positivos por cada 100 en eval-dev.
- Detección de fallos visibles en un flujo de captación: la ronda r3 se entrenó específicamente para capturar fallos, y en la evaluación se reporta una tasa de captura de fallos visibles del 81 % en eval-dev y del 78 % en el holdout sellado.
- Automatización de decisiones con latencia medida: el endpoint devuelve `latency_ms` en cada respuesta, lo que permite instrumentar el rendimiento en producción y comparar despliegues.
- Investigación sobre modelos pequeños especializados: sirve como caso de estudio reproducible de ajuste fino con LoRA encadenado y fusión WiSE sobre un modelo de 1,9 B, con evaluación sobre un holdout sellado ejecutado una sola vez.
- Evaluación de privacidad por diseño: al ejecutarse offline y solo en loopback, es adecuado para entornos donde los datos de casos no pueden salir del dispositivo del usuario.

## Benchmarks y rendimiento

Evaluación K0 de triaje de pistas para organizaciones nuevas de Spotlight, con la calibración de la release y el tamaño de conjunto por defecto:

| Split | Falsos indicios por 100 | Recall de indicios | Fallos visibles capturados | Pistas perdidas |
|---|---|---|---|---|
| eval-dev (85 pistas) | 2,35 | 0,768 | 0,81 | 0 |
| holdout sellado (89 pistas, ejecutado una vez) | 0,0 | 0,884 | 0,78 | 0 |

La fila de eval-dev se reprodujo exactamente desde esta carpeta mediante `d1_serve.py`; la latencia fue la única diferencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 6,3 GB de pico en Apple Silicon con MPS y bfloat16; en CPU el consumo será similar o superior, sin dato exacto publicado.
- GPU recomendadas: no se especifican GPU NVIDIA; el entorno documentado es macOS arm64 con MPS.
- Cabe en GPU de consumo: sí, por tamaño (1,9 B de parámetros) cabría en tarjetas con 8 GB o más de VRAM, aunque el autor solo documenta el camino MPS/CPU.
- Opciones de despliegue: servidor propio `d1_serve.py` con torch 2.14.1 y transformers 5.21.0 en un venv de Python 3.12; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas; el endpoint devuelve `latency_ms` por petición, pero no se publica un valor de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-2b-spotlight-r3 | ≈1,9 B | 65.536 tokens de estado | Clasificación de triaje, sin generación | LFM Open License v1.0 (umbral 10 M USD) | Hugging Face, 21 descargas |
| LiquidAI/d1-2B (base) | ≈1,9 B | no disponible | Modelo base lfm3_vl de propósito general | LFM Open License v1.0 | Hugging Face |
| Otros ajustes de triaje de 1-3 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: no genera texto ni mantiene conversaciones; usarlo fuera del triaje de Spotlight producirá resultados sin sentido.
- Los datos de entrenamiento no se publican, por lo que no es posible auditar la composición del dataset ni detectar sesgos de muestreo.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración: las probabilidades devueltas dependen de `calibration.json` y del conjunto de preguntas; fuera de ese dominio la calibración no está garantizada.
- El holdout sellado se ejecutó una sola vez (89 pistas), por lo que las métricas tienen alta varianza estadística y no deben extrapolarse sin cautela.
- Licencia LFM Open License v1.0: el uso comercial solo se concede a entidades por debajo de 10 millones de dólares de facturación anual; por encima es necesario negociar con el licenciante.
- El servidor no tiene autenticación y escucha solo en loopback; exponerlo en red requiere añadir una capa de autenticación propia.
- El repositorio debe descargarse como carpeta, no cargarse por nombre: `save_pretrained` reescribe `auto_map` y rompe la carga si se regenera la configuración.
- Idiomas soportados no documentados; no hay evidencia de comportamiento multilingüe.
- Dependencias muy específicas (torch 2.14.1, transformers 5.21.0, Python 3.12, macOS arm64) con lock de hashes; desviarse de ellas puede impedir la carga del código personalizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomvaillant/d1-2b-spotlight-r3
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Revisión base: https://huggingface.co/LiquidAI/d1-2B/tree/cfe5760ff5d5998f91d9ac56bd4b2dbd96996d41
- Licencia LFM Open License v1.0: incluida como `LICENSE` en el repositorio del modelo
- Repositorio de código del servidor: `d1_serve.py`, incluido en el repositorio del modelo
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
