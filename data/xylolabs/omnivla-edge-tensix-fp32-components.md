# Xylolabs/omnivla-edge-Tensix-FP32-Components

## Resumen

OmniVLA-Edge Tensix FP32 Components es un paquete de componentes de pesos derivado del modelo de politica robotica OmniVLA-Edge (NHirose/omnivla-edge), preparado por Xylolabs para su portabilidad a hardware Tenstorrent Tensix. No se trata de un modelo autonomo, sino de una exportacion de un subconjunto seleccionado de tensores del checkpoint original, reempaquetados en safetensors FP32 con layouts matematicos portables. El objetivo es facilitar la integracion de estas partes del modelo en stacks de inferencia sobre aceleradores Tensix.

El paquete incluye tres ficheros de pesos: las ramas CNN de EfficientNet con BatchNorm plegada, las proyecciones FiLM y de imagen, y el decodificador transformer junto con las cabezas de pose, waypoint y distancia. En total son 626 tensores en float32 que ocupan aproximadamente 0,36 GB. La relevancia actual radica en que permite a desarrolladores de robotica llevar un modelo de navegacion visual-lenguaje-accion (VLA) a hardware alternativo, aunque requiere del codigo y los componentes restantes del modelo original para ejecutarse de extremo a extremo.

El modelo base OmniVLA-Edge es una politica de navegacion robotica que combina vision, lenguaje y accion. Este paquete concreto no es ejecutable por si solo: necesita la politica upstream, el preprocesado de observaciones, el codificador de texto CLIP y la integracion de los layouts plegados. La licencia declarada es MIT, heredada del checkpoint fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica VLA robotica con ramas CNN EfficientNet, proyecciones FiLM y decodificador transformer |
| Parametros totales | no disponible (el paquete contiene 626 tensores, no el modelo completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (float32) unicamente en este paquete |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El paquete exporta componentes de una politica de navegacion robotica multimodal. La arquitectura subyacente combina tres ramas CNN basadas en EfficientNet (con BatchNorm plegada para inferencia), proyecciones FiLM que modulan caracteristicas visuales a partir de caracteristicas de texto CLIP precalculadas, y un decodificador transformer con cabezas especificas para pose, waypoint y distancia. Los tensores se almacenan en sus layouts matematicos de origen: los filtros de convolucion conservan sus ejes de canal y kernel declarados, y las formas matriciales y tablas deterministas se documentan en `component.json`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. El proceso de esta exportacion consiste en plegado de BatchNorm, seleccion de componentes y verificacion numerica contra la referencia FP32 original. Las comprobaciones reportadas muestran un RMSE normalizado maximo de 2,51e-06 en CNN (60 comparaciones), 6,32e-07 en FiLM (153 comparaciones) y 0 en el decodificador (9 comparaciones), con un PCC minimo superior a 0,999999999996 sobre entradas sinteticas fijas.

## Capacidades

- Navegacion robotica visual-lenguaje-accion: el modelo base esta disenado para generar acciones de navegacion a partir de observaciones visuales e instrucciones en lenguaje natural.
- Procesamiento multimodal: integra caracteristicas de imagen (via CNN EfficientNet) y de texto (via CLIP) mediante modulacion FiLM.
- Prediccion de pose, waypoints y distancia: el decodificador incluye cabezas especificas para estas salidas.
- No incluye soporte de tool calling ni function calling.
- No incluye capacidades de agente multi-paso ni razonamiento generico.
- Capacidades multilingues limitadas al ingles segun la model card.
- Este paquete por si solo no ejecuta ninguna de estas capacidades: requiere la politica upstream completa.

## Casos de uso

- Portabilidad a aceleradores Tenstorrent: el paquete permite cargar los pesos plegados en un stack de inferencia Tensix, sirviendo como base para portar la politica OmniVLA-Edge a hardware alternativo a GPU.
- Verificacion de fidelidad numerica: los tensores y sus checksums permiten validar que una implementacion propia reproduce los valores FP32 de referencia antes de integrar el modelo completo.
- Desarrollo de pipelines de navegacion robotica: integrado con la politica upstream, el decodificador y las cabezas permiten generar waypoints y poses para robots moviles en entornos controlados.
- Investigacion en VLA: util para estudiar como se comportan los componentes plegados (CNN, FiLM, decoder) de forma aislada en experimentos de ablation.
- Preprocesado y benchmarking de hardware: los ficheros safetensors FP32 sirven para medir throughput y latencia de las capas CNN y transformer en Tensix sin depender del modelo completo.
- Integracion en sistemas de robotica industrial: combinado con el codificador CLIP y el preprocesado de observaciones, puede alimentar bucles de control de navegacion en robots con instrucciones en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas roboticas en la informacion disponible. La model card solo reporta comprobaciones de fidelidad numerica frente a la referencia FP32:

| Componente | Comparaciones | RMSE normalizado maximo |
|---|---:|---:|
| CNN | 60 | 2,5115232e-06 |
| FiLM | 153 | 6,31850881e-07 |
| Decoder | 9 | 0 |

El PCC minimo sobre estos registros supera 0,999999999996. Estas metricas miden fidelidad numerica sobre entradas sinteticas fijas, no exito en tareas roboticas. No se reporta velocidad.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,36 GB solo para los pesos de los componentes, mas espacio para buffers de trabajo.
- GPU recomendadas: no disponible; el paquete esta orientado a aceleradores Tenstorrent Tensix, no a GPU convencionales.
- Cabe en GPU consumer: si, por tamano (0,36 GB), aunque el paquete no esta pensado para ejecucion directa en CUDA sin la politica upstream.
- Opciones de despliegue: carga mediante PyTorch y safetensors con el script `load_components.py` incluido; requiere integracion manual con la politica upstream.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/omnivla-edge-Tensix-FP32-Components | Componentes de politica VLA (FP32) | no disponible (626 tensores, 0,36 GB) | no disponible | MIT | Hugging Face |
| NHirose/omnivla-edge | Politica VLA completa (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| OmniVLA (fuente) | Politica VLA de navegacion | no disponible | no disponible | no disponible | GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no es un modelo autonomo: requiere la politica upstream, el preprocesado de observaciones, el codificador de texto CLIP y la integracion de los layouts plegados para ejecutarse.
- Las comprobaciones numericas se realizaron sobre entradas sinteticas fijas; el exito en tareas roboticas requiere evaluacion separada.
- No se reporta velocidad ni latencia, lo que impide evaluar su viabilidad en bucles de control en tiempo real sin mediciones propias.
- Idioma limitado al ingles.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible.
- Restricciones de licencia: MIT para los pesos; el codigo generico del loader de Xylolabs usa Apache 2.0. Se debe conservar el aviso de copyright y permisos del upstream incluido en `LICENSE`.
- Al ser una exportacion de componentes, cambios en la politica upstream pueden invalidar la integracion de estos layouts plegados.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/omnivla-edge-Tensix-FP32-Components
- Modelo base: https://huggingface.co/NHirose/omnivla-edge
- Repositorio OmniVLA: https://github.com/NHirose/OmniVLA/tree/5182600cb4a9ee07684e17cdd2a6cbafc56b8a68
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Codigo del loader: https://huggingface.co/Xylolabs/omnivla-edge-Tensix-FP32-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/omnivla-edge-Tensix-FP32-Components/blob/main/LICENSE
- Repositorio tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
