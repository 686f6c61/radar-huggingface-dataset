# sudarshanharithas/MotionGlot

## Resumen

MotionGlot es un modelo de generación de movimiento multi-corporal (multi-embodied) desarrollado por Sudarshan Harithas y Srinath Sridhar (proyecto alojado en el IVL de la Universidad de Brown, según el enlace del proyecto). Resuelve la generación de movimiento humano y de robots cuadrúpedos a partir de texto, además de tareas asociadas como el captioning de movimiento, el alcance de objetivos (goal reaching) y la generación humana condicionada por preguntas. Su interés radica en unificar varios tipos de cuerpo bajo un único tokenizador y un mismo modelo generativo.

La arquitectura combina un modelo causal autorregresivo tipo GPT-2 con tokenizadores VQ-VAE específicos por cuerpo: un tokenizador humano de 512 códigos que representa características de 263 dimensiones y un tokenizador cuadrúpedo de 128 códigos para trayectorias tridimensionales. La generación se realiza en el espacio de códigos discretos y un decodificador VQ recupera las trayectorias o características finales. El vocabulario unificado del GPT tiene 51.694 tokens.

El checkpoint publicado es un artefacto de investigación recuperado en el paso 29.200 de entrenamiento, no un modelo reentrenado ni reproducido de forma independiente. Los pesos GPT son idénticos al checkpoint de la demo online, y no se incluyen el estado del optimizador ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autorregresivo tipo GPT-2 + tokenizadores VQ-VAE por cuerpo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Exportaciones ONNX en float16 (GPT) y float32 (VQ-VAE); no se especifican cuantizaciones GGUF o INT8 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPT), .pth (VQ-VAE humano y robot), ONNX (exportaciones para navegador) |

## Arquitectura y entrenamiento

MotionGlot emplea un modelo causal autorregresivo basado en GPT-2 que opera sobre un tokenizador unificado de 51.694 tokens. El movimiento se discretiza mediante VQ-VAE: `human_vq.pth` usa 512 codigos para codificar caracteristicas humanas de 263 dimensiones, mientras que `robot_vq.pth` usa 128 codigos para trayectorias tridimensionales de un cuadrupedo. La generacion produce codigos especificos del cuerpo y el decodificador VQ correspondiente reconstruye las trayectorias o caracteristicas. El paquete admite seis tareas: generacion y captioning humano y de robot, alcance de objetivos y generacion humana condicionada por preguntas.

El checkpoint liberado corresponde al paso 29.200 e incluye el tokenizador compartido, los modelos VQ humano y robot, y la normalizacion humana (media y desviacion estandar en `normalization.npz`). No se incluyen el estado del optimizador ni los datos de entrenamiento, y no se ha realizado un reentrenamiento completo ni una reproduccion independiente de los resultados del articulo. El tokenizador VQ-VAE humano se atribuye a T2M-GPT. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de movimiento humano a partir de texto (text-to-human).
- Generacion de movimiento de robot cuadrupedo (trayectorias tridimensionales).
- Captioning de movimiento humano y de robot (motion-to-text).
- Alcance de objetivos (goal reaching) en el espacio de movimiento.
- Generacion humana condicionada por preguntas.
- Salida en espacio de codigos discretos que requiere el decodificador VQ correspondiente para obtener trayectorias o caracteristicas.
- Multilingue: no; solo ingles (en).
- Tool calling / function calling: no disponible (no es un modelo de lenguaje de proposito general).
- Soporte de agentes o razonamiento multi-paso: no disponible.

## Casos de uso

- Animacion y previsualizacion de movimiento humano: dado un texto como "A person walks forward", el modelo genera movimiento en el espacio de caracteristicas humanas que, tras el decodificador VQ, se puede visualizar.
- Control de robots cuadrupedos: el modelo genera trayectorias tridimensionales que un controlador externo puede transformar en comandos de locomocion; el propio modelo no envia comandos al hardware.
- Anotacion automatica de datasets de movimiento: la tarea de captioning convierte secuencias de movimiento en descripciones textuales, util para etiquetar corpus de captura de movimiento.
- Investigacion en generacion multimodal: sirve como base para estudiar la unificacion de distintos cuerpos (humanos y robots) bajo un mismo modelo generativo.
- Demostraciones interactivas en navegador: las tres tareas de movimiento humano se ejecutan en el navegador mediante exportaciones ONNX, sin instalacion ni inicio de sesion, con visualizacion y fisica deshabilitadas.
- Navegacion guiada por objetivos: la tarea de goal reaching permite generar movimiento que alcanza un estado objetivo, aplicable a planificacion de trayectorias.
- Sistemas de interaccion humano-robot: la generacion condicionada por preguntas permite producir movimiento humano en respuesta a consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que no se realizo un reentrenamiento completo ni una reproduccion independiente de los resultados del articulo; los artefactos liberados pasaron comprobaciones de carga estricta del estado VQ y de inferencia con un unico ejemplo para las seis tareas.

## Requisitos de hardware

- El ejemplo oficial de inferencia se ejecuta en CPU (`--device cpu`), por lo que el modelo es ejecutable sin GPU.
- Tamano del repositorio: 1,1 GB (incluye GPT, VQ humano y VQ robot).
- Demo en navegador: descarga aproximadamente 293 MB en el primer uso y se ejecuta en el navegador con exportaciones ONNX (GPT en float16).
- VRAM estimada: no disponible de forma oficial; por el tamano del bundle es reducida, apta para GPUs de consumo.
- GPUs recomendadas: no disponible. La ejecucion en CPU y en navegador implica que tarjetas como una RTX 4090 o superiores son suficientes con holgura.
- Opciones de despliegue: paquete fuente MotionGlot (comando `motionglot generate`), exportaciones ONNX para navegador y compatibilidad con la libreria transformers (`endpoints_compatible`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Cuerpos | Tokenizador | Licencia |
|---|---|---|---|---|
| MotionGlot | GPT-2 + VQ-VAE multi-cuerpo | humano y cuadrupedo | unificado 51.694 tokens; VQ 512/128 codigos | Apache-2.0 |
| T2M-GPT | GPT + VQ-VAE | humano | VQ-VAE humano reutilizado por MotionGlot | no disponible |

No se dispone de datos de parametros ni de contexto de estos modelos en la informacion proporcionada, por lo que no se puede realizar una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es un checkpoint de investigacion recuperado (paso 29.200), no un modelo reentrenado; el estado del optimizador y los datos de entrenamiento no se incluyen.
- La particion de entrenamiento original difiere de las particiones del codigo de publicacion (source-isolated splits).
- No se realizo un reentrenamiento completo ni una reproduccion independiente de los benchmarks del articulo.
- Las salidas de robot son trayectorias para un controlador separado, no comandos enviados directamente al hardware.
- No se incluyen los archivos de dataset ni de modelo corporal (body-model).
- La licencia Apache-2.0 exige atribucion a T2M-GPT por el tokenizador VQ-VAE humano; deben consultarse los avisos de terceros del repositorio de codigo.
- Solo soporta ingles (en) como idioma.
- No hay informacion sobre sesgos ni sobre riesgo de alucinacion en el material proporcionado.

## Enlaces

- HuggingFace: https://huggingface.co/sudarshanharithas/MotionGlot
- Paper (arXiv): https://arxiv.org/abs/2410.16623
- Proyecto: https://ivl.cs.brown.edu/research/motionglot.html
- Codigo: https://github.com/sudarshan-s-harithas/MotionGlot-A-Multi-Embodied-Motion-Generation-Model
- Demo en navegador: https://sudarshan-s-harithas.github.io/motionglot-demo/
- Exportaciones ONNX: https://huggingface.co/sudarshanharithas/MotionGlot/tree/browser-v0.1.0/browser
- Documentacion de la demo de navegador: https://github.com/sudarshan-s-harithas/MotionGlot-A-Multi-Embodied-Motion-Generation-Model/blob/main/docs/browser-demo.md
