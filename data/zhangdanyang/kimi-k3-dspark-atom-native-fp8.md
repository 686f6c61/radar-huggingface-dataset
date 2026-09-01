# Zhangdanyang/Kimi-K3-DSpark-ATOM-Native-FP8

## Resumen

El modelo `Zhangdanyang/Kimi-K3-DSpark-ATOM-Native-FP8` es una cuantización en FP8 del modelo draft `Inferact/Kimi-K3-DSpark`, desarrollado por el usuario Zhangdanyang. Este draft forma parte del ecosistema de decodificación especulativa de Kimi-K3, el modelo de Moonshot AI con aproximadamente 2,8 billones de parámetros. El draft está diseñado para acelerar la inferencia de Kimi-K3 en vLLM mediante el método nativo `dspark`, que entrena el modelo draft sobre las hidden states extraídas del propio motor de inferencia, garantizando que las numericas de entrenamiento coincidan con las de producción.

Con 3.582.956.801 parámetros (~3,58B) y pesos en FP8, este modelo ocupa unos 5,2 GB en el repositorio y se distribuye en formato safetensors. Está pensado para ser cargado como un componente auxiliar dentro de vLLM, no como un modelo de generación autónomo. Su acceso es restringido (gated) en HuggingFace, por lo que requiere aceptar las condiciones del repositorio antes de su descarga. La licencia no está especificada en la ficha, aunque el modelo base `Inferact/Kimi-K3-DSpark` se distribuye bajo la licencia `kimi-k3` según su página en ModelScope.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLA (Multi-head Latent Attention) nativo, segun la descripcion del modelo base |
| Parametros totales | 3.582.956.801 (~3,58B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (cuantizacion nativa, generada con Quark) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el modelo base usa licencia kimi-k3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft model diseñado para decodificacion especulativa. Segun la informacion del repositorio base, `Inferact/Kimi-K3-DSpark` es un modelo "MLA-native DSpark" que se entrena sobre las hidden states extraidas directamente de vLLM, el mismo motor que lo sirve en produccion. Esto asegura que las representaciones internas aprendidas durante el entrenamiento coincidan con las que el modelo encuentra en inferencia, mejorando la tasa de aceptacion de los tokens especulados.

La cuantizacion FP8 se ha realizado con la herramienta Quark, como indican los tags del repositorio. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la arquitectura interna exacta del draft (numero de capas, dimensiones, etc.), aunque al ser un modelo de 3,58B y estar basado en MLA, se asume una estructura transformer con atencion latente multi-cabeza, similar a la empleada en Kimi-K3.

## Capacidades

- Aceleracion de inferencia de Kimi-K3 mediante decodificacion especulativa en vLLM.
- Integracion nativa con el metodo `dspark` de vLLM, que permite generar multiples tokens especulativos por paso.
- Entrenamiento alineado con las hidden states del motor de inferencia, lo que maximiza la tasa de aceptacion de los tokens propuestos.
- No es un modelo de generacion autonoma: no puede utilizarse de forma independiente para tareas de texto, codigo o razonamiento.
- No se han documentado capacidades de tool calling, agentes, vision ni audio, ya que su unica funcion es actuar como modelo draft.

## Casos de uso

- Despliegue de Kimi-K3 en produccion con vLLM: el draft se carga junto al modelo principal para reducir la latencia por token y aumentar el throughput en entornos de servicio masivo.
- Optimizacion de costes de inferencia: al reducir el numero de pasos de decodificacion del modelo grande, se disminuye el consumo de VRAM y de computo por peticion.
- Evaluacion de tecnicas de decodificacion especulativa: investigadores pueden comparar la tasa de aceptacion de este draft frente a otros (p. ej., EAGLE) en sus propios workloads.
- Integracion en pipelines de IA generativa de alto volumen: chatbots, asistentes virtuales o generacion de codigo que requieran respuestas rapidas con el modelo Kimi-K3.
- Pruebas de cuantizacion FP8 en modelos draft: este repositorio sirve como referencia para estudiar el impacto de la cuantizacion en la calidad de los tokens especulados.
- Entornos con restricciones de VRAM: al ser un modelo de solo 3,58B en FP8, puede ejecutarse en GPUs consumer junto al modelo principal, siempre que se disponga de la memoria total necesaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre tasa de aceptacion, latencia media ni throughput comparado con otros draft models. Tampoco se han encontrado evaluaciones estandar como MMLU, HumanEval o GSM8K, ya que este modelo no esta disenado para tareas de generacion directa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6 GB para los pesos en FP8 (3,58B parametros × 1 byte), mas overhead de activaciones y KV cache. En la practica, se recomienda al menos 6-8 GB de VRAM libre para el draft, ademas de la memoria requerida por Kimi-K3.
- GPU recomendadas: cualquier GPU con soporte FP8 y suficiente VRAM para el modelo principal. Para Kimi-K3 (2,8T parametros) se necesitan multiples GPUs de alta gama (A100, H100) o configuraciones distribuidas. El draft en si cabe en GPUs consumer como RTX 3090, RTX 4090 o RTX 6000 Ada.
- Opciones de despliegue: vLLM con soporte nativo para `dspark` (metodo especulativo). No se ha documentado compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Dependen del modelo principal, del hardware y de la tasa de aceptacion del draft.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros draft models (p. ej., EAGLE, Medusa, Lookahead). El unico dato relevante es que este draft esta especificamente entrenado para Kimi-K3 y su metodo `dspark`, mientras que otros draft models suelen ser agnosticos al modelo objetivo. No se han encontrado benchmarks comparativos publicados.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que es necesario solicitar acceso y aceptar las condiciones del autor antes de descargar.
- Licencia no especificada: aunque el modelo base usa licencia `kimi-k3`, este repositorio no declara una licencia explicita, lo que puede generar incertidumbre legal para uso comercial.
- No es un modelo de generacion autonoma: intentar usarlo como un LLM estandar dara resultados incorrectos o fallos, ya que su salida son hidden states o tokens especulativos, no texto final.
- Dependencia de vLLM: requiere una version de vLLM que soporte el metodo `dspark` y la arquitectura MLA. No funciona con otros frameworks de inferencia.
- Riesgo de alucinacion y sesgos: al ser un modelo auxiliar, no se evaluan sesgos ni alucinaciones propias, pero hereda las limitaciones del modelo principal Kimi-K3.
- Cuantizacion FP8: puede introducir una ligera degradacion en la calidad de los tokens especulados frente a la version BF16, aunque no se han publicado mediciones al respecto.
- Fecha de creacion futura: el repositorio fue creado en septiembre de 2026, lo que sugiere que es un modelo reciente y con poca adopcion (0 descargas, 0 likes).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Zhangdanyang/Kimi-K3-DSpark-ATOM-Native-FP8
- Modelo base en HuggingFace: https://huggingface.co/Inferact/Kimi-K3-DSpark
- Variante FP8-PTPC del mismo autor: https://huggingface.co/Zhangdanyang/Kimi-K3-DSpark-FP8-PTPC
- Modelo en ModelScope: https://www.modelscope.cn/models/skyai/Kimi-K3-DSpark
- Repositorio GitHub sobre inferencia NPU de Kimi K3: https://github.com/zqc214/cann-infer-ds-dspark/tree/main/models/kimi_k3
- Noticia sobre Kimi K3 y su prueba de seguridad: https://cybersecuritynews.com/kimi-k3-ai-model-escapes-sandbox/
