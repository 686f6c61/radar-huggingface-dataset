# Xylolabs/smolvla-base-Tenstorrent-Tensix-Components

## Resumen

SmolVLA inference components for Tenstorrent Tensix es un archivo de componentes de inferencia derivado de SmolVLA, el modelo de vision-lenguaje-accion (VLA) para robotica de LeRobot. Lo publica Xylolabs, que separa los pesos aprendidos del modelo original en ficheros safetensors portables, organizados por submodulo (vision, text, expert y assembly), con el objetivo de facilitar su integracion numerica en entornos Tenstorrent Tensix.

No es un modelo entrenado de nuevo ni un checkpoint listo para usar con `from_pretrained`: es un archivo de componentes que requiere ensamblaje de la politica por separado. Contiene vision mas conector, el prefijo de texto de 16 capas, el expert de accion de 16 capas con proyecciones de accion y tiempo, y tensores de estado y ensamblaje. Se omiten la cabeza del modelo de lenguaje no utilizada y no se aplica cuantizacion nueva.

El paquete ocupa 0,8 GB y conserva los 499 tensores aprendidos con sus valores y dtypes originales (473 BF16 y 31 FP32, incluidos cinco estaticos). Es relevante para quienes trabajan en el despliegue de politicas roboticas sobre hardware Tenstorrent y necesitan los pesos del modelo base SmolVLA en un formato verificable y desacoplado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de SmolVLA; vision + conector, prefijo de texto de 16 capas, expert de accion de 16 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se aplica cuantizacion nueva; dtypes BF16 y FP32 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (componentes separados; 473 BF16 y 31 FP32) |

## Arquitectura y entrenamiento

El archivo deriva de SmolVLA, un modelo VLA construido sobre el backbone SmolVLM2. La estructura separada en componentes incluye un modulo de vision con conector (198 tensores, todos BF16), un prefijo de texto de 16 capas (146 tensores BF16), un expert de accion de 16 capas con proyecciones de accion y tiempo (153 tensores: 129 BF16 y 24 F32) y un modulo de ensamblaje con 7 tensores F32. La cabeza del modelo de lenguaje no utilizada se omite.

No se ha realizado entrenamiento adicional en este export: los 499 tensores aprendidos conservan sus valores y dtypes originales y se verifican exactamente contra la politica original fijada. Los cinco estaticos de ensamblaje (mascaras y tablas rotatorias) se regeneran en GPU siguiendo las formulas originales y coinciden exactamente. No se aplica cuantizacion nueva. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion del modelo base en la informacion proporcionada.

## Capacidades

- Vision-lenguaje-accion: el modelo base SmolVLA procesa observaciones visuales y lenguaje para generar acciones roboticas.
- Componentes de inferencia para integracion numerica en Tenstorrent Tensix.
- Carga verificable: el loader comprueba hash de fichero, nombre de tensor, forma, dtype y valores finitos sin alterar la precision.
- Separacion modular en vision, text, expert y assembly para ensamblaje de la politica.
- No incluye cabeza de lenguaje ni soporte directo de `from_pretrained`.
- No soporta por si mismo tool calling, agentes ni razonamiento multi-paso: es un archivo de pesos parcial, no un modelo conversacional.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Despliegue de politicas roboticas en hardware Tenstorrent: los componentes permiten cargar los pesos de SmolVLA en un runtime Tensix y ensamblar la politica para control de robots, evitando depender de un checkpoint monolítico.
- Integracion numerica y validacion de portes: el loader verifica hash, forma, dtype y valores finitos, lo que permite comprobar que el porte a Tensix reproduce exactamente los pesos originales antes de ejecutar inferencia.
- Investigacion en VLA sobre aceleradores alternativos: util para estudiar el comportamiento de SmolVLA en hardware Tenstorrent comparandolo con ejecuciones en GPU, manteniendo los dtypes originales.
- Pipeline de evaluacion de componentes: al estar separados vision, text y expert, se pueden probar submodulos de forma aislada (por ejemplo, el conector vision-lenguaje) sin cargar la politica completa.
- Archivado reproducible de pesos: los ficheros safetensors con hashes por fichero y `component.json` con formas y dtypes exactos sirven como referencia auditable del modelo base.
- Base para adaptadores personalizados: un equipo puede construir su propio runner sobre LeRobot usando estos componentes como fuente de pesos verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este archivo no establece exito en tareas roboticas ni throughput, y que la velocidad no se reporta.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 0,81 GB solo para los pesos de los componentes, mas espacio para buffers de trabajo.
- GPU recomendadas: no disponible; el foco del export es Tenstorrent Tensix, no GPU convencional.
- Cabe en GPU consumer: si, por tamano de pesos (0,81 GB), aunque no se documenta soporte de ejecucion directa.
- Opciones de despliegue: carga via PyTorch, safetensors y huggingface_hub con el loader `load_components.py`; el ensamblaje de la politica requiere la implementacion original de LeRobot, tokenizer, preprocesado y un adaptador de nombres de componente.
- No compatible con `from_pretrained` directo ni con runners estandar tipo vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/smolvla-base-Tenstorrent-Tensix-Components | Archivo de componentes VLA | no disponible | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | Modelo VLA completo | no disponible | no disponible | Apache 2.0 | Hugging Face |
| SmolVLM2 (backbone) | Vision-lenguaje | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo ejecutable de forma autonoma: requiere ensamblaje de la politica con LeRobot, tokenizer, preprocesado y adaptador de nombres.
- No soporta `from_pretrained`; los ficheros cargan state dictionaries de componentes, no una politica lista.
- No incluye la cabeza del modelo de lenguaje no utilizada.
- No se ha evaluado el exito en tareas roboticas con este archivo; las comprobaciones solo garantizan serializacion e identidad con la fuente.
- No se reporta velocidad ni throughput.
- Riesgo de sesgos y alucinaciones del modelo base no documentado en la informacion disponible; al ser un modelo VLA, los errores se traducen en acciones fisicas incorrectas.
- Idioma limitado al ingles segun la model card.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE`; el loader de Xylolabs usa Apache 2.0 (`CODE_LICENSE`).
- Se proporciona "as is", sin garantia; no afiliado ni respaldado por Tenstorrent.
- El uso en produccion exige validar el ensamblaje completo y las observaciones del robot antes de confiar en las acciones generadas.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/smolvla-base-Tenstorrent-Tensix-Components
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Codigo del loader: https://github.com/XylolabsInc/tensix-bfp-gptq
- Implementacion LeRobot: https://github.com/huggingface/lerobot
- Documentacion Tenstorrent: https://docs.tenstorrent.com
