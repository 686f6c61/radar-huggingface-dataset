# Xylolabs/smolvla-base-Tensix-Components

## Resumen

SmolVLA-base-Tensix-Components es un archivo de componentes de inferencia extraidos del modelo robotico SmolVLA (`lerobot/smolvla_base`) y empaquetados en safetensors portables por Xylolabs. No se trata de un modelo completo listo para usar, sino de un conjunto de pesos separados por submodulos (vision, conector, prefijo de texto de 16 capas, experto de accion de 16 capas y tensores de estado/ensamblaje) pensado para integracion numerica en el hardware Tensix de Tenstorrent. El modelo base SmolVLA es un modelo vision-language-action (VLA) compacto desarrollado por Hugging Face (LeRobot) para control de robots, construido sobre el backbone SmolVLM2.

El interes de esta publicacion es la portabilidad: separa 499 tensores aprendidos en cuatro ficheros de componentes con dtypes originales preservados (473 entradas BF16 y 31 FP32, incluyendo cinco mascaras/tablas rotatorias estaticas), omitiendo la cabeza del modelo de lenguaje, que no se usa en inferencia de politica robotica. El archivador declara unos 0,81 GB de memoria de dispositivo solo para los pesos de los componentes.

Es relevante ahora porque permite a desarrolladores que trabajan con aceleradores Tenstorrent reutilizar los pesos de SmolVLA sin depender de un runner completo de LeRobot, aunque exige ensamblar la politica por separado. No establece exito en tareas roboticas ni throughput; solo garantiza identidad numerica con la politica original fijada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLM2; vision + conector + prefijo de texto (16 capas) + experto de accion (16 capas) con proyecciones de accion/tiempo |
| Parametros totales | no disponible (el repo ocupa 0,8 GB; el archivador declara ~0,81 GB de memoria para pesos de componentes) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sin cuantizacion nueva; dtypes originales BF16 y FP32 (473 BF16, 31 FP32) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (componentes separados; `component.json` declara formas/dtypes y hashes por fichero) |

## Arquitectura y entrenamiento

La arquitectura subyacente es SmolVLA, un modelo VLA que combina un codificador visual, un conector y un transformer de lenguaje dividido en un prefijo de texto de 16 capas y un experto de accion de 16 capas con proyecciones de accion y tiempo. Esta exportacion conserva 499 tensores aprendidos con sus valores y dtypes originales, mas cinco constantes estaticas de ensamblaje regeneradas con las formulas originales. Se omiten la cabeza del modelo de lenguaje no utilizada y cualquier componente de ensamblaje de politica completo.

No se proporcionan en la informacion disponible datos sobre volumen de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones de decodificacion del modelo base. La evaluacion realizada por Xylolabs se limita a verificar que cada uno de los 499 tensores aprendidos coincide exactamente con la politica original fijada, que el fichero de politica original coincide con su hash LFS de Hugging Face, que las cinco constantes estaticas se regeneran en GPU y coinciden, y que todos los valores almacenados son finitos. No se reporta evaluacion de tareas roboticas ni velocidad.

## Capacidades

- Archivo de componentes de inferencia para politica robotica VLA: vision, conector, prefijo de texto y experto de accion.
- Carga verificada por hash, nombre de tensor, forma, dtype y valor finito sin alterar precision.
- Preservacion de dtypes originales (BF16 y FP32) para integracion numerica en hardware Tensix.
- No incluye cabeza de modelo de lenguaje ni runner completo; requiere ensamblaje de politica con LeRobot, tokenizer y preprocesado.
- No soporta `from_pretrained` directo como politica.
- Capacidades de tool calling, agentes, razonamiento multi-paso o multilingue: no disponibles en esta informacion.
- Capacidad especial: orientado a control robotico (acciones), no a generacion de texto general.

## Casos de uso

- Integracion en aceleradores Tenstorrent: cargar los componentes en el dispositivo Tensix mediante el loader incluido para ejecutar la politica SmolVLA sobre hardware de Tenstorrent, verificando hashes y dtypes antes de la inferencia.
- Validacion numerica de portes: usar los tensores como referencia exacta para comprobar que una implementacion propia de SmolVLA reproduce los valores de la politica original fijada.
- Investigacion en robotica con VLA: ensamblar una politica de control a partir de los componentes y el codigo de LeRobot para experimentar con tareas de manipulacion, asumiendo que el exito en tarea debe medirse aparte.
- Desarrollo de pipelines de despliegue en borde: aprovechar el tamano compacto (~0,81 GB de pesos) para prototipos en dispositivos con memoria limitada, siempre que se disponga de un adaptador de nombres de componente.
- Auditoria de pesos: emplear `component.json` y los hashes por fichero para auditar la procedencia y consistencia de los pesos antes de desplegarlos en produccion.
- Benchmarking de hardware: comparar latencia y throughput de la politica ensamblada entre Tensix y GPU, aunque este archivador no reporta cifras propias de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta verificacion de identidad numerica (499 tensores coincidentes, hashes validados, valores finitos) y no reporta exito en tareas roboticas ni throughput.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 0,81 GB solo para pesos de componentes, mas buffers de trabajo.
- GPU recomendadas: no disponible (el objetivo declarado es hardware Tenstorrent Tensix).
- Compatibilidad con GPU consumer: no disponible; el archivador no especifica requisitos de VRAM para GPU convencional.
- Opciones de despliegue: loader propio (`load_components.py`) con PyTorch, safetensors y huggingface_hub; requiere LeRobot para ensamblar la politica. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no reportados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/smolvla-base-Tensix-Components | no disponible (~0,81 GB de pesos) | no disponible | Apache 2.0 | safetensors (componentes) | Archivo de componentes, no politica completa |
| lerobot/smolvla_base | no disponible | no disponible | Apache 2.0 | safetensors | Modelo base original completo |
| SmolVLM2 (backbone) | no disponible | no disponible | Apache 2.0 | safetensors | Backbone vision-language del que deriva SmolVLA |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo ejecutable de extremo a extremo: requiere ensamblaje de politica, tokenizer, preprocesado y adaptador de nombres de componente.
- No soporta `from_pretrained` directo como politica.
- No se ha evaluado el exito en tareas roboticas ni el rendimiento; solo se garantiza identidad numerica con la politica original.
- Solo idioma ingles declarado.
- Riesgo de sesgos y alucinacion del modelo base no documentado en esta informacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara no estar afiliado ni respaldado por Tenstorrent.
- Se proporciona "tal cual", sin garantia.
- La cabeza del modelo de lenguaje esta excluida; no sirve para generacion de texto general.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/smolvla-base-Tensix-Components
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Codigo del loader: https://github.com/XylolabsInc/tensix-bfp-gptq
- Implementacion LeRobot: https://github.com/huggingface/lerobot
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion Tenstorrent: https://docs.tenstorrent.com
