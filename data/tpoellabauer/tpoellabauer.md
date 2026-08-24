# tpoellabauer/tpoellabauer

## Resumen
Este perfil de Hugging Face corresponde a Thomas Pöllabauer, investigador en visión por computador, no a un modelo de IA generativa o de aprendizaje automático listo para inferencia. Su trabajo se centra en la estimación de pose 6D de objetos, la generación de datos sintéticos y la detección de transparencia y distorsión. Publica datasets especializados y artículos académicos en estas áreas, pero no ofrece un modelo con arquitectura, pesos o pipeline de inferencia. Por tanto, esta ficha documenta el perfil y sus recursos, no un modelo ejecutable.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento
No aplica. El perfil no describe ningún modelo entrenado. Los datasets publicados (DISTOPIA, IGD, YCB-V-DS, etc.) se usan para entrenar y evaluar modelos de visión por computador, pero el propio perfil no incluye pesos ni arquitecturas. Los artículos asociados (arXiv:2402.05610, arXiv:2411.13149, arXiv:2503.03655) detallan métodos para estimación de pose 6D, pero no se proporcionan implementaciones concretas en este perfil.

## Capacidades
- Investigación en estimación de pose 6D de objetos, incluyendo objetos metálicos y domésticos.
- Generación de datos sintéticos para detección de transparencia y distorsión (dataset DISTOPIA).
- Creación de datasets de pose 6D en formato BOP (IGD) y extensiones de YCB-V con grabaciones estéreo y de profundidad.
- Técnicas de luminance keying para localización de objetos (YCB-LUMA, YCB-V-LUMA).
- Publicaciones sobre generalización de Neural Radiance Fields para pose 6D robusta ante apariencias no vistas.

## Casos de uso
- Investigación académica en visión por computador: los datasets permiten reproducir experimentos de estimación de pose 6D y detección de transparencia.
- Desarrollo de sistemas de robótica: los datos de pose 6D (IGD, YCB-V-DS) sirven para entrenar algoritmos de agarre y manipulación de objetos metálicos.
- Validación de métodos de detección de transparencia: DISTOPIA ofrece 315 escenas panorámicas para probar algoritmos en entornos realistas.
- Entrenamiento de modelos de segmentación y detección: los datasets con luminance keying facilitan la adquisición rápida de datos etiquetados.
- Benchmarking de estimadores de pose: YCB-V-RAND y YCB-V-LUMA proporcionan variantes con randomización de dominio y claves de luminancia para comparar robustez.
- Estudio de generalización en pose 6D: los artículos y datasets permiten evaluar métodos frente a apariencias no vistas, como objetos metálicos reflectantes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El perfil no incluye métricas de rendimiento de ningún modelo.

## Requisitos de hardware
No aplica. No hay modelo que ejecutar. Los datasets, sin embargo, requieren almacenamiento significativo (DISTOPIA ocupa 998 GB) y GPUs para entrenar modelos de visión, pero no se especifican requisitos concretos.

## Comparativa con modelos similares
No disponible. No existe un modelo comparable porque el perfil no define un modelo de IA.

## Limitaciones y advertencias
- No es un modelo de IA: no se puede descargar ni ejecutar para tareas de generación, clasificación u otras.
- Los datasets pueden tener sesgos inherentes a los objetos y escenas representados (objetos metálicos, entornos industriales).
- La licencia de los datasets no está especificada en el perfil; se debe contactar al autor para uso comercial.
- Los artículos describen métodos, pero no se garantiza la disponibilidad de código fuente.
- El perfil está orientado a investigación; no hay soporte para integración en producción.

## Enlaces
- Perfil de Hugging Face: https://huggingface.co/tpoellabauer
- Dataset DISTOPIA: https://huggingface.co/datasets/tpoellabauer/DISTOPIA
- Dataset IGD: https://huggingface.co/datasets/tpoellabauer/IGD
- Dataset YCB-V-DS: https://huggingface.co/datasets/tpoellabauer/YCB-V-DS
- Dataset YCB-V-RAND: https://huggingface.co/datasets/tpoellabauer/YCB-V-RAND
- Dataset YCB-V-LUMA: https://huggingface.co/datasets/tpoellabauer/YCB-V-LUMA
- Dataset YCB-LUMA: https://huggingface.co/datasets/tpoellabauer/YCB-LUMA
- Artículo arXiv:2402.05610: https://arxiv.org/abs/2402.05610
- Artículo arXiv:2411.13149: https://arxiv.org/abs/2411.13149
- Artículo arXiv:2503.03655: https://arxiv.org/abs/2503.03655
- Sitio web personal: https://www.thomaspoellabauer.com/
- Repositorio GitHub: https://github.com/tpoellabauer/tpoellabauer.github.io
