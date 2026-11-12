# teo-clerk/floodfusion

## Resumen

floodfusion v1.2 es un modelo de segmentación semántica de imágenes SAR (radar de apertura sintética) orientado a la generación de mapas de extensión de inundaciones a partir de datos Sentinel-1. Lo desarrolla teo-clerk y se distribuye como un conjunto de pesos "congelados" (tres semillas: 42, 43, 44) asociados a un test ciego pre-registrado sobre activaciones del Copernicus Emergency Management Service. Cada archivo de pesos pesa 72,7 MB, lo que lo sitúa en la categoría de modelos ligeros.

El modelo resuelve un problema operativo concreto: producir una primera estimación de la huella de una inundación tras el primer pase de Sentinel-1, para que un analista de mapeo rápido la revise. Combina una red de fusión por cross-attention entre SAR y óptico (Sentinel-2, usado solo donde está despejado), con información de terreno (Copernicus DEM, JRC surface water, ESA WorldCover) y una referencia estacional de Sentinel-1: la mediana de retrodispersión de la misma órbita en torno a la misma fecha del año anterior, y el cambio respecto a ella.

Es relevante ahora porque publica un protocolo de evaluación ciego y sellado (activa desde EMSR899, hasta 20 activaciones en 15 clústeres o el 31 de diciembre de 2027) y porque cuantifica explícitamente el techo de referencia: dos delineaciones de Copernicus EMS de la misma zona hechas con menos de 24 horas de diferencia coinciden entre sí con un macro IoU de 0,520. El modelo no es un LLM ni un modelo multimodal de propósito general: es un segmentador geoespacial especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentación con fusión SAR–óptico por cross-attention, contexto de terreno y referencia estacional Sentinel-1 (fila 21 de la matriz de experimentos) |
| Parametros totales | no disponible (peso por semilla: 72,7 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por teselas; ventana espacial definida por el stack de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`best.pt`, cargable con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

La red (identificada como "row 21" en el repositorio) aplica cross-attention entre las bandas SAR de Sentinel-1 RTC y las bandas ópticas de Sentinel-2, condicionada por capas auxiliares de terreno y por una referencia estacional calculada como la mediana de retrodispersión de la misma órbita en torno a la misma fecha del año anterior, junto con el cambio respecto a esa referencia. El pipeline de inferencia lee Sentinel-1 RTC, Copernicus DEM, JRC surface water y ESA WorldCover desde Microsoft Planetary Computer, y Sentinel-2 donde está despejado; el stack de entrada tiene 14 bandas.

El entrenamiento usa etiquetas de Kuro Siwo (Bountos et al., NeurIPS 2024, CC BY 4.0, anotaciones fijadas en `Orion-AI-Lab/KuroSiwo-annotations@b930dd27`) y de GEOID-Flood (Chiriaco et al., 2026, CC BY 4.0, revisión `868407460bf3` de `links-ads/geoid-flood`): 7.006 teselas de 138 inundaciones agrupadas en 81 grupos de localización. La calibración se hace por temperature scaling ajustado sobre grupos de validación reservados, con una calibración separada para ventanas sin óptico utilizable. El umbral de decisión τ* = 0,25 se deriva de una relación de coste declarada entre falsos negativos y falsas alarmas de 3. La validación de la reconstrucción del stack es explícita: en una tesela de benchmark replicada (EMSR683 AOI02), las 14 bandas de entrada resultaron idénticas.

## Capacidades

- Segmentación semántica binaria de agua/inundación sobre imágenes Sentinel-1 RTC, con máscara de exclusión y banda de baja confianza por producto.
- Fusión SAR–óptico: incorpora Sentinel-2 solo en ventanas sin nubosidad, con calibración específica para ventanas sin óptico.
- Uso de referencia estacional: compara la retrodispersión actual con la mediana de la misma órbita en la misma fecha del año anterior.
- Contexto de terreno: integra DEM, agua superficial permanente y cobertura del suelo para desambiguar.
- Generación de productos geoespaciales: capas COG, un ítem STAC y polígonos de inundación por tesela.
- Inferencia en CPU suficiente para generar un mapa de cualquier lugar y fecha dentro de la cobertura de Sentinel-1.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No estima profundidad, daños ni impacto; el mapa es una instantánea en el momento de la adquisición.

## Casos de uso

- Mapeo rápido de inundaciones tras un evento: un analista lanza `floodfusion.live map` sobre el primer pase de Sentinel-1 y obtiene una extensión preliminar con máscara de exclusión, que revisa en las zonas marcadas de baja confianza.
- Cribado de grandes áreas: el modelo procesa teselas de forma independiente y permite priorizar qué zonas requieren delineación manual detallada antes de que lleguen los equipos de campo.
- Triaje de activaciones Copernicus EMS: al compararse contra delineaciones oficiales con una métrica común (macro IoU a τ*), sirve como primera pasada para identificar dónde la delineación manual aporta más valor.
- Monitorización estacional de llanuras de inundación: la referencia estacional integrada permite distinguir agua permanente o recurrente de una inundación nueva, útil para seguimiento de humedales y zonas agrícolas anegadas.
- Integración en pipelines geoespaciales: los productos COG y STAC se insertan directamente en visores GIS y en flujos de publicación de datos de emergencia.
- Evaluación comparativa frente a productos operativos: el modelo reporta frente al Copernicus Global Flood Monitoring (GFM) sobre las 34 activaciones cubiertas, lo que permite usarlo como referencia en estudios de validación de productos de inundación.
- Investigación en fusión SAR–óptico: los pesos congelados, los `run.json` y los manifiestos SHA256 permiten reproducir experimentos exactos y comparar variantes de calibración.

## Benchmarks y rendimiento

Resultados sobre las 38 activaciones de Copernicus EMS de 2023–26 dibujadas sobre satélites radar (EMSR664 excluida), puntuadas una sola vez tras el congelado:

| Modelo | Macro IoU a τ* | IoU con umbral oráculo | AP |
|---|---|---|---|
| floodfusion v1.2 (fila 21) | 0,417 | 0,468 | 0,598 |
| TerraMind-base + LoRA, mismo entrenamiento | 0,405 | 0,446 | 0,583 |
| v1.1 (fusión, etiquetas Kuro Siwo) | 0,407 | 0,438 | 0,527 |
| Baseline físico (umbrales sobre cambio de retrodispersión) | 0,373 | — | — |

Sobre las 34 activaciones cubiertas por Copernicus Global Flood Monitoring, el modelo obtiene 0,419 frente a 0,321 de GFM; solo la diferencia frente a GFM es estadísticamente significativa. El techo de referencia (acuerdo entre dos delineaciones EMS de la misma zona con menos de 24 horas de diferencia) es de 0,520 macro IoU sobre 34 activaciones vistas. En la tesela replicada del benchmark, la ejecución en CPU reproduce el IoU a τ* del run guardado en GPU (0,414); el stack en vivo, sin máscara de área de interés, obtiene 0,421 sobre los mismos píxeles.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación; el tamaño de pesos (72,7 MB por semilla) sugiere huella de memoria muy reducida.
- Inferencia en CPU: documentada explícitamente como suficiente para generar un mapa de cualquier lugar y fecha.
- GPU recomendadas: no especificadas.
- Cabe en cualquier GPU consumer: por tamaño de pesos (72,7 MB) es prácticamente seguro, aunque el fabricante no lo confirma.
- Despliegue: paquete Python del repositorio (`uv sync --frozen`, comandos `floodfusion.weights` y `floodfusion.live`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencia externa: el comando `live` requiere acceso a Microsoft Planetary Computer para leer Sentinel-1 RTC, DEM, JRC surface water, ESA WorldCover y Sentinel-2.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros / tamaño | Contexto | Rendimiento (macro IoU τ*) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| floodfusion v1.2 (fila 21) | Segmentación SAR–óptico especializada | 72,7 MB por semilla | no aplica | 0,417 | CC BY 4.0 | Pesos en HF + repo GitHub |
| TerraMind-base + LoRA | Modelo fundacional geoespacial adaptado | no disponible | no disponible | 0,405 | no disponible en la información | Referencia comparativa del autor |
| floodfusion v1.1 | Versión anterior (fusión, etiquetas Kuro Siwo) | no disponible | no aplica | 0,407 | CC BY 4.0 (presumible) | Versión previa del mismo repo |
| Baseline físico | Umbrales sobre cambio de retrodispersión | no aplica | no aplica | 0,373 | no aplica | Metodología publicada |
| Copernicus GFM | Producto operativo | no aplica | no aplica | 0,321 (34 activaciones) | Servicio Copernicus | Operativo |

## Limitaciones y advertencias

- Agua no visible por radar C-band: bajo dosel cerrado y entre edificios. Bosque denso y suelo urbanizado se marcan como "no mapeable de forma fiable"; un "seco" en esas zonas significa "no visto".
- Sombra radar y layover quedan excluidos del producto; no deben interpretarse como ausencia de inundación.
- No estima profundidad, daños ni impacto; el mapa es una instantánea en el instante de adquisición.
- No debe usarse para denegar asistencia a un área marcada "seca" bajo dosel, en ciudad, en sombra radar o fuera de la hora de adquisición.
- Modos de fallo conocidos documentados en el repositorio: nubosidad parcial, transferencia del umbral y agua agitada por viento.
- El test confirmatorio (activaciones desde EMSR899) está sellado y no se conocerá hasta alcanzar 20 activaciones en 15 clústeres o el 31 de diciembre de 2027; los resultados actuales son descriptivos sobre inundaciones vistas.
- El stack en vivo no incluye máscara de área de interés, por lo que la red lee también el terreno circundante; esto cambia ligeramente la puntuación respecto al benchmark.
- Los comandos `weights` y `live` llegan a `main` con la release v1.3.0; hasta entonces viven en la rama `feat/v1.3-live`, lo que introduce un paso manual de reproducción.
- Licencia CC BY 4.0: permite uso comercial con atribución; los datos de entrenamiento incluyen material de Copernicus y de Kuro Siwo con sus propias condiciones de atribución.
- Sin datos publicados sobre sesgos, cobertura geográfica desbalanceada o rendimiento por región más allá de los grupos de localización del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teo-clerk/floodfusion
- Repositorio GitHub: https://github.com/teo-clerk/floodfusion
- Model card completa del repositorio: https://github.com/teo-clerk/floodfusion/blob/main/MODEL_CARD.md
- Dataset GEOID-Flood: https://huggingface.co/datasets/links-ads/geoid-flood
- Anotaciones Kuro Siwo: https://github.com/Orion-AI-Lab/KuroSiwo-annotations
- Microsoft Planetary Computer: https://planetarycomputer.microsoft.com/
- Informes citados en la model card (rutas del repositorio): `reports/v12_cems_rebuilt.md`, `reports/v12_cems_seen_tests.md`, `reports/reference_ceiling.md`, `reports/protocol_v1_2.md`, `reports/v12_freeze.json`
