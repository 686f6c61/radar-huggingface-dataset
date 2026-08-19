# xhznju/dsar

## Resumen

DSAR (Dual-Stream Autoregressive Modeling of Temporal Cloth Dynamics for Photorealistic Animatable Avatars) es un trabajo de investigación presentado en ECCV 2026 por Haozhong Xiong, Yao Yu, Yu Zhou y Sidan Du. Propone un framework de modelado autorregresivo de doble flujo para capturar la dinámica temporal de la ropa en avatares humanos animables, con el objetivo de lograr un fotorrealismo avanzado en la representación de tejidos y sus movimientos. El método se centra en el problema de animar avatares con ropa que se deforma de forma realista, algo crítico en aplicaciones de realidad virtual, videojuegos y producción cinematográfica.

Actualmente, el repositorio en Hugging Face actúa únicamente como una tarjeta de proyecto (paper card): no se han publicado pesos, código ni demos. Toda la información disponible se limita al artículo de arXiv (2608.10500) y a la página del proyecto. Por tanto, esta ficha describe el enfoque conceptual y el estado de publicación, no un modelo listo para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (paper card; se describe como modelado autorregresivo de doble flujo) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (tarea de vision por computador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (sin checkpoints publicados) |

## Arquitectura y entrenamiento

El articulo propone un enfoque de modelado autorregresivo de doble flujo (dual-stream autoregressive) para la dinamica temporal de la ropa en avatares animables. La idea central es representar la deformacion de la tela como una secuencia temporal que se predice de forma autorregresiva, combinando dos flujos de informacion (posiblemente uno espacial y otro temporal, aunque los detalles no se especifican en la tarjeta). No se proporcionan datos sobre el tamaño de la red, el conjunto de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO. Al ser un articulo de investigacion, estas especificaciones tecnicas no estan disponibles en la informacion publica actual.

## Capacidades

- Modelado de la dinamica temporal de ropa en avatares humanos animables.
- Generacion de avatares fotorrealistas con movimiento de tejido coherente.
- Enfoque basado en modelado autorregresivo, lo que sugiere capacidad de prediccion secuencial de estados de deformacion.
- No se documentan capacidades adicionales como generacion de texto, codigo, vision general o tool calling. El ambito se limita a la animacion de avatares.

## Casos de uso

Dado que el modelo no tiene implementacion publica ni demos, no se pueden enumerar casos de uso practicos verificados. No obstante, por la naturaleza del trabajo, los casos de uso potenciales serian:

- Animacion de personajes virtuales en tiempo real para videojuegos o entornos de realidad virtual, donde la ropa debe responder de forma realista a los movimientos del cuerpo.
- Produccion cinematografica y de efectos visuales, para generar avatares digitales con vestimenta que se deforma de manera fisicamente plausible.
- Simulacion de ropa en entornos de diseno de moda virtual, permitiendo previsualizar prendas sobre modelos animados.
- Creacion de avatares para telepresencia inmersiva, donde la fidelidad visual de la ropa es esencial para la sensacion de presencia.

Sin embargo, estas aplicaciones son hipoteticas hasta que se liberen el codigo y los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo de arXiv podria contener metricas, pero no se han extraido en esta ficha. No se dispone de comparaciones cuantitativas con otros metodos.

## Requisitos de hardware

No disponibles. Al no existir pesos ni implementacion, no se puede estimar VRAM, GPUs recomendadas ni opciones de despliegue. No se conocen datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, ya que se trata de un trabajo de investigacion sin publicacion de artefactos. No se puede establecer una comparacion objetiva con otras soluciones de animacion de avatares.

## Limitaciones y advertencias

- No hay codigo, pesos ni demos disponibles; el repositorio es solo una tarjeta de proyecto.
- No se especifican licencias de uso, por lo que no se puede determinar si el modelo (cuando se publique) sera utilizable comercialmente.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto, ya que no hay implementacion que evaluar.
- La fecha de publicacion (2026) y el estado de aceptacion en ECCV sugieren que el trabajo es reciente, pero sin artefactos no es posible validar su funcionamiento.

## Enlaces

- [Hugging Face](https://huggingface.co/xhznju/dsar)
- [arXiv](https://arxiv.org/abs/2608.10500)
- [PDF](https://arxiv.org/pdf/2608.10500)
- [DOI](https://doi.org/10.48550/arXiv.2608.10500)
- [Project Page](https://dsar-0810.github.io/)
- [GitHub del autor](https://github.com/hzxiong23)
- [Sitio personal del autor](https://hzxiong23.github.io/)
