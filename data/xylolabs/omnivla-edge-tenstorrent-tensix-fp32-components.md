# Xylolabs/omnivla-edge-Tenstorrent-Tensix-FP32-Components

## Resumen

OmniVLA-Edge components for Tenstorrent Tensix (FP32) es un paquete de pesos derivado de OmniVLA-Edge (NHirose/omnivla-edge), una política de navegación robótica visual-lenguaje-acción (VLA) orientada a edge. Lo publica Xylolabs y no contiene un modelo ejecutable de extremo a extremo, sino un conjunto seleccionado de componentes en safetensors FP32 preparados para su portabilidad a hardware Tensix de Tenstorrent: ramas CNN plegadas, proyecciones FiLM y tensores del decodificador y las cabezas de pose, waypoint y distancia.

El paquete incluye 626 tensores en float32 que ocupan aproximadamente 0,36 GB, distribuidos en tres ficheros: `cnn-weights.safetensors` (492 tensores, tres ramas EfficientNet con BatchNorm plegado en inferencia), `film-weights.safetensors` (65 tensores) y `decoder-weights.safetensors` (69 tensores). La ejecución completa de la política requiere el modelo upstream, el preprocesado de observaciones, el codificador de texto CLIP y la integración de los layouts plegados.

Es relevante para equipos que trabajan en despliegue de políticas robóticas sobre aceleradores Tensix y que necesitan componentes numéricamente fieles al checkpoint original en FP32 antes de aplicar sus propias transformaciones (cuantización, formatos BFP, etc.). La licencia es MIT y el paquete está pensado como material de integración, no como sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA (OmniVLA-Edge): ramas CNN EfficientNet, proyecciones FiLM sobre características CLIP, decodificador transformer y cabezas de pose/waypoint/distancia |
| Parametros totales | no disponible (el paquete contiene 626 tensores en FP32, ~0,36 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (este paquete está en float32; no incluye variantes cuantizadas) |
| Idiomas soportados | en |
| Licencia | MIT (checkpoint original); código del loader genérico de Xylolabs bajo Apache 2.0 |
| Formato de pesos | safetensors (float32), más `component.json` con layouts matemáticos y `load_components.py` |

## Arquitectura y entrenamiento

El paquete no entrena nada: es una exportación de componentes de OmniVLA-Edge, una política de navegación visual-lenguaje-acción. La arquitectura subyacente combina tres ramas CNN EfficientNet con BatchNorm plegado para inferencia, un bloque FiLM que recibe características de texto CLIP precalculadas y un decodificador transformer con cabezas específicas de pose, waypoint y distancia, además de tablas deterministas de modo. Los 626 tensores se almacenan en float32 en sus layouts matemáticos de origen: los filtros convolucionales conservan sus ejes de canal/kernel declarados y las formas matriciales y tablas deterministas se documentan en `component.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica de este paquete es el plegado de BatchNorm y de normas adyacentes para dejar los pesos en una forma adecuada para puertos Tensix, junto con verificaciones numéricas frente a la referencia FP32 original: 60 comparaciones en la CNN (RMSE normalizado máximo 2,5115232e-06), 153 en FiLM (6,31850881e-07) y 9 en el decodificador (0), con un PCC mínimo superior a 0,999999999996 sobre registros sintéticos fijos.

## Capacidades

- Navegación robótica visual-lenguaje-acción: la política base produce waypoints, pose y estimaciones de distancia a partir de observaciones visuales e instrucciones en lenguaje natural.
- Condicionamiento por texto mediante características CLIP precalculadas en la frontera FiLM.
- Componentes CNN con BatchNorm plegado listos para portar a Tensix.
- Decodificador transformer con cabezas de pose, waypoint y distancia y tablas deterministas de modo.
- Verificación de integridad: `load_components.py` comprueba hash de cada componente, nombre y forma de tensor, dtype FP32 y valores finitos.
- No incluye tool calling, function calling, soporte de agentes multi-paso, visión general, audio ni modo de razonamiento extendido.
- Multilingüe: no; el modelo declara únicamente inglés.

## Casos de uso

- Portado a Tenstorrent Tensix: usar los tensores FP32 como entrada para las herramientas de conversión de Xylolabs (tensix-bfp-gptq) y generar versiones adaptadas al formato nativo del acelerador, partiendo de pesos ya plegados y verificados.
- Validación numérica de un pipeline de despliegue: comparar la salida de las implementaciones propias contra estos componentes de referencia FP32 para detectar desviaciones introducidas por el plegado o la cuantización.
- Integración en un runner de política completo: combinar estos componentes con el checkpoint upstream NHirose/omnivla-edge, el preprocesado de observaciones y el codificador CLIP para reconstruir la política ejecutable.
- Investigación en navegación VLA en edge: estudiar el desglose CNN/FiLM/decoder y experimentar con sustituciones parciales (por ejemplo, cambiar el decodificador) manteniendo el resto fijo.
- Base para experimentos de cuantización: al estar en float32 y con layouts documentados en `component.json`, sirve como punto de partida reproducible para evaluar BFP u otros formatos de bajo precisión en Tensix.
- Auditoría de licencias y trazabilidad: el paquete incluye la nota de copyright MIT completa en `LICENSE` y los cambios y fronteras de componentes en `NOTICE`, útil en entornos con requisitos de cumplimiento.
- Docencia y reproducción: el loader y las comprobaciones de integridad permiten reproducir la fidelidad numérica del export en un equipo de sobremesa sin hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas robóticas en la información disponible. Las únicas métricas publicadas son de fidelidad numérica frente a la referencia FP32 original:

| Componente | Comparaciones | RMSE normalizado máximo |
|---|---:|---:|
| cnn | 60 | 2,5115232e-06 |
| film | 153 | 6,31850881e-07 |
| decoder | 9 | 0 |

El PCC mínimo sobre estos registros supera 0,999999999996. Estas comprobaciones se realizaron sobre entradas sintéticas fijas; el éxito en tareas robóticas requiere evaluación separada y no se reporta velocidad.

## Requisitos de hardware

- Memoria para los pesos del paquete: aproximadamente 0,36 GB en FP32, más espacio para buffers de trabajo (el autor indica que se necesita memoria adicional para buffers).
- GPU: no se especifican modelos recomendados; el paquete está orientado a Tenstorrent Tensix, no a GPU convencionales.
- Cabe en cualquier GPU de consumo con al menos ~1 GB de VRAM libre para cargar los tres ficheros, aunque la política completa requiere además el modelo upstream y el codificador CLIP.
- Despliegue: el paquete se carga con PyTorch y safetensors mediante `load_components.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/omnivla-edge-Tenstorrent-Tensix-FP32-Components | Componentes de política VLA en FP32 | 626 tensores (~0,36 GB) | no disponible | MIT | Hugging Face |
| NHirose/omnivla-edge | Política VLA completa (modelo base) | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |
| Otros modelos VLA de navegación robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede ejecutar la política por sí solo. Requiere el checkpoint upstream, el preprocesado de observaciones, el codificador de texto CLIP y la integración de los layouts plegados.
- Las comprobaciones numéricas se hicieron sobre entradas sintéticas fijas; no garantizan el éxito en tareas robóticas reales.
- No se reportan métricas de velocidad, latencia ni throughput.
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al tratarse de una política de navegación, los fallos se traducen en acciones físicas incorrectas, con implicaciones de seguridad en robótica.
- Licencia MIT para el checkpoint original, con nota de copyright completa en `LICENSE`; el código del loader genérico de Xylolabs usa Apache 2.0. Verificar la compatibilidad en uso comercial combinado.
- El paquete está pensado para Tensix; usarlo en otros aceleradores exige trabajo de integración adicional.
- Fecha de creación del repositorio (2026-11-14) y ausencia de descargas o likes: madurez y adopción aún no contrastadas.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/omnivla-edge-Tenstorrent-Tensix-FP32-Components
- Modelo base: https://huggingface.co/NHirose/omnivla-edge
- Repositorio de código de referencia (OmniVLA): https://github.com/NHirose/OmniVLA/tree/5182600cb4a9ee07684e17cdd2a6cbafc56b8a68
- Herramientas Tensix de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Loader incluido: https://huggingface.co/Xylolabs/omnivla-edge-Tenstorrent-Tensix-FP32-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/omnivla-edge-Tenstorrent-Tensix-FP32-Components/blob/main/LICENSE
