# yj0942/H3MD-Expression

## Resumen

H3MD Expression Studio (H3MD 表情工作台) es un nodo personalizado para ComfyUI, no un modelo de lenguaje. Lo desarrolla el usuario yj0942 y se distribuye como espejo de descarga de un repositorio GitHub (1113800942/ComfyUI-H3MD-Expression). Su funcion es aplicar expresiones faciales precisas a cualquier rostro mediante tres vias: deslizadores manuales, una biblioteca de 22 expresiones predefinidas o transferencia desde un video de referencia. El resultado se puede exportar como RefMod para MiniMax H3 (integrandose con H3MD Director) o como imagen a tamano completo con la nueva expresion.

Tecnicamente se apoya en LivePortrait (red de animacion facial de Kuaishou, licencia MIT) y en el detector de rostros YuNet de OpenCV (MIT), empaquetados junto al codigo propio bajo licencia AGPL-3.0-or-later. El paquete incluye un workflow de ejemplo y no requiere dependencias pip adicionales; los pesos de LivePortrait (~520 MB) se descargan automaticamente en el primer uso a `models/liveportrait`.

Es relevante para flujos de postproduccion y generacion de video con personajes, ya que permite controlar la expresion facial de forma determinista antes de inyectarla en un pipeline de video generativo (MiniMax H3). La version documentada es la v0.8.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (nodo ComfyUI basado en LivePortrait para animacion facial y YuNet para deteccion de rostros) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la documentacion esta en chino e ingles) |
| Licencia | AGPL-3.0-or-later |
| Formato de pesos | No disponible (pesos de LivePortrait descargados en runtime, ~520 MB) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado por el autor, sino de un nodo de orquestacion sobre modelos existentes. La animacion facial la realiza la red LivePortrait de Kuaishou, que el paquete incorpora como codigo de terceros bajo licencia MIT. La deteccion de rostros usa OpenCV YuNet (MIT). El nodo anade una capa de control (deslizadores, biblioteca de 22 expresiones y transferencia desde video) y rutas de exportacion hacia el formato RefMod de MiniMax H3 o hacia imagen final.

La model card no detalla datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO, porque el autor no entrena ningun modelo base. Tampoco se documentan innovaciones tecnicas propias mas alla de la integracion con H3MD Director y el formato RefMod.

## Capacidades

- Aplicacion de expresiones faciales mediante deslizadores con control fino.
- Biblioteca integrada de 22 expresiones predefinidas.
- Transferencia de expresion facial desde un video de referencia.
- Exportacion como RefMod compatible con MiniMax H3 y H3MD Director.
- Exportacion como imagen a tamano completo con la nueva expresion aplicada.
- Deteccion automatica de rostros mediante YuNet.
- Funcionamiento como nodo dentro de ComfyUI, con workflow de ejemplo incluido.
- No soporta generacion de texto, codigo, matematicas, tool calling, agentes ni capacidades multilingues de tipo LLM.

## Casos de uso

- Postproduccion de retratos: aplicar una expresion concreta (por ejemplo, sorpresa o contencion del llanto) a una fotografia antes de entregarla, exportando la imagen a tamano completo sin necesidad de otras herramientas.
- Preparacion de RefMods para video generativo: generar el RefMod con la expresion deseada e inyectarlo en H3MD Director para condicionar la generacion de video con MiniMax H3.
- Transferencia de actuacion entre clips: copiar la expresion de un video de referencia a un personaje distinto, util para doblaje o reshooting sin actor presente.
- Creacion de hojas de expresiones para personajes: producir variantes controladas de un mismo rostro para preproduccion, storyboards o assets de videojuego.
- Iteracion rapida en pipelines ComfyUI: al no requerir dependencias pip extra y descargar los pesos automaticamente, se integra en flujos existentes sin reconfigurar el entorno.
- Prototipado de animacion facial: usar los deslizadores y la biblioteca de 22 expresiones para explorar rangos expresivos antes de fijar una actuacion definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentacion; LivePortrait opera sobre imagenes, por lo que la huella es contenida, pero no se especifica cifra.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; no se indica hardware minimo.
- Almacenamiento: ~520 MB adicionales para los pesos de LivePortrait en `models/liveportrait`.
- Despliegue: ComfyUI (copia del zip en `custom_nodes/ComfyUI-H3MD-Expression` y reinicio). Para RefMod se requiere ademas el VAE de video de MiniMax H3 y los nodos H3 RefMod (ComfyUI-MiniMaxH3Mod).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Enfoque | Licencia | Integracion |
|---|---|---|---|---|
| H3MD Expression Studio | Nodo ComfyUI | Edicion y transferencia de expresion facial, export RefMod | AGPL-3.0-or-later | ComfyUI, MiniMax H3 |
| LivePortrait (Kuaishou) | Modelo de animacion facial | Animacion de retratos por video de conduccion | MIT | Independiente, integrable |
| H3MD Director | Nodo/flujo ComfyUI | Direccion de video con RefMods | No disponible | ComfyUI, MiniMax H3 |

No se dispone de datos de rendimiento comparativo entre estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni responde a prompts conversacionales.
- Depende de LivePortrait y YuNet; la calidad del resultado queda acotada por esos componentes.
- La generacion de RefMod exige instalar ademas el VAE de video de MiniMax H3 y ComfyUI-MiniMaxH3Mod; sin ellos solo funciona la exportacion a imagen.
- La licencia AGPL-3.0-or-later impone obligaciones de copyleft: el uso en servicios en red puede requerir publicar el codigo modificado. Revisar antes de un despliegue comercial.
- El paquete incorpora codigo de terceros (LivePortrait, MIT; OpenCV YuNet, MIT); consultar `THIRD_PARTY_NOTICES.md`.
- El repositorio de Hugging Face es solo un espejo; la fuente canonica y las actualizaciones estan en GitHub.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados: madurez y soporte no verificables.
- No se documentan sesgos, tasas de alucinacion ni limites de contexto por tratarse de una herramienta de edicion de imagen y no de un modelo generativo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/yj0942/H3MD-Expression
- Repositorio GitHub (fuente): https://github.com/1113800942/ComfyUI-H3MD-Expression
- H3MD Director: https://huggingface.co/yj0942/H3MD-Director
