# t-firefly/qwen3-1.7b-rknn3-rk1820

## Resumen

Qwen3-1.7B es un modelo de lenguaje causal ligero desarrollado por el equipo Qwen de Alibaba, diseñado para tareas de generación de texto, diálogo, razonamiento y codificación. Este repositorio específico contiene una conversión del modelo original a formato RKNN3, realizada por el equipo Firefly AI, con el objetivo de desplegarlo en el coprocesador de IA RK1820 de Rockchip, un chip diseñado para inferencia de redes neuronales en dispositivos de borde.

La relevancia de este modelo radica en que permite ejecutar un LLM de 1.700 millones de parámetros en hardware de bajo consumo, como el RK1820, sin depender de la nube. El modelo original soporta modos de pensamiento y no pensamiento, así como más de 100 idiomas y dialectos, lo que lo convierte en una opción versátil para aplicaciones de IA en el borde. La conversión a RKNN3 y su integración con la herramienta de despliegue LlamaPi simplifican el proceso de puesta en producción en dispositivos embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parametros totales | 1.700 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo original soporta 32.768 tokens) |
| Tipos de cuantizacion | RKNN3 (cuantizacion especifica para RK1820) |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun modelo original) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKNN3 (formato propietario de Rockchip para el coprocesador) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer causal denso de 1.700 millones de parametros. El modelo original fue entrenado por el equipo Qwen con un enfoque en instruccion, dialogo, codificacion y razonamiento. Soporta dos modos de inferencia: modo pensamiento (thinking), que genera una cadena de razonamiento antes de responder, y modo no pensamiento, que responde directamente. Esta capacidad dual se logra mediante un token especial que activa o desactiva el razonamiento explicito.

La conversion realizada por Firefly AI no modifica los pesos del modelo original, sino que los transforma al formato RKNN3, optimizado para el coprocesador RK1820. Este proceso incluye cuantizacion y optimizacion especifica para la arquitectura del chip, lo que permite una inferencia eficiente en terminos de latencia y consumo energetico. No se han publicado detalles sobre el dataset de entrenamiento del modelo original en la informacion disponible.

## Capacidades

- Generacion de texto en mas de 100 idiomas y dialectos.
- Razonamiento multi-step con modo pensamiento activable.
- Instruccion y dialogo conversacional multi-turno.
- Generacion de codigo y asistencia en programacion.
- Soporte para tareas de razonamiento logico y matematico basico.
- Despliegue en hardware de borde gracias a la conversion a RKNN3.

## Casos de uso

- Asistentes virtuales en dispositivos embebidos: el modelo puede gestionar conversaciones multi-turno sin conexion a internet, ideal para altavoces inteligentes o kioscos interactivos que requieren privacidad y baja latencia.
- Automatizacion de atencion al cliente en entornos con conectividad limitada: desplegado en un RK1820, puede responder consultas frecuentes, derivar problemas complejos y operar de forma autonoma en sucursales o puntos de venta remotos.
- Generacion de codigo asistida en entornos de desarrollo sin acceso a la nube: los desarrolladores pueden usar el modelo para autocompletar funciones, explicar fragmentos de codigo o generar tests en equipos locales con hardware de bajo consumo.
- Traduccion y transcripcion en tiempo real para dispositivos de traduccion portatiles: su soporte multilingue permite traducciones basicas entre pares de idiomas sin depender de servicios externos.
- Clasificacion y resumen de documentos en sistemas de gestion documental: el modelo puede procesar textos locales, extraer puntos clave y clasificar documentos en categorias predefinidas, todo en el dispositivo.
- Prototipado rapido de aplicaciones de IA en hardware Rockchip: los desarrolladores pueden validar ideas y conceptos con un LLM real en placas de desarrollo como la AIO-GS1N2-RK182X antes de escalar a soluciones en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento del modelo convertido ni comparativas con otras implementaciones.

## Requisitos de hardware

- Placa de desarrollo con coprocesador RK1820 o RK1828 (por ejemplo, AIO-GS1N2-RK182X).
- El RK1820 actua como dispositivo de aceleracion de IA conectado al host (por ejemplo, un SoC RK3588) mediante PCIe.
- No requiere GPU dedicada; la inferencia se ejecuta en el coprocesador RK1820.
- Se recomienda el uso de la herramienta LlamaPi para gestionar la descarga, carga y ejecucion del modelo.
- El tamano del repositorio es de 1,8 GB, lo que indica que el modelo cuantizado ocupa aproximadamente esa cantidad de almacenamiento.
- La latencia y el throughput dependen de la configuracion del RK1820 y no se han publicado datos especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-1.7B (original) | 1.700 M | 32.768 tokens | Apache-2.0 | Hugging Face, ModelScope |
| Qwen3-1.7B RKNN3 (este modelo) | 1.700 M | No disponible | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B | 1.500 M | 32.768 tokens | Apache-2.0 | Hugging Face |

El modelo original de Qwen3-1.7B es comparable en tamano a Qwen2.5-1.5B, pero con mejoras en razonamiento y soporte multilingue. La version RKNN3 no anade diferencias funcionales respecto al original, pero esta optimizada para un hardware especifico, lo que la hace incomparable directamente con modelos en formato GGUF o safetensors en terminos de rendimiento en el borde.

## Limitaciones y advertencias

- La informacion disponible no incluye detalles sobre sesgos especificos del modelo convertido, pero hereda las limitaciones del modelo original, que puede presentar sesgos en temas sensibles.
- Riesgo de alucinacion inherente a los modelos de lenguaje; se recomienda validar las respuestas en aplicaciones criticas.
- La longitud de contexto del modelo convertido no esta documentada; se asume que hereda los 32.768 tokens del original, pero no se ha confirmado.
- El formato RKNN3 es propietario de Rockchip y solo puede ejecutarse en hardware compatible (RK1820/RK1828/RK3572), lo que limita su portabilidad a otras plataformas.
- La licencia Apache-2.0 permite uso comercial, pero los derechos de autor del modelo original pertenecen al equipo Qwen; se debe respetar la atribucion correspondiente.
- El despliegue requiere el uso de LlamaPi y el entorno RKNN3-Toolkit, lo que anade una curva de aprendizaje para desarrolladores no familiarizados con el ecosistema Rockchip.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t-firefly/qwen3-1.7b-rknn3-rk1820
- Modelo original en Hugging Face: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo original en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-1.7B
- Documentacion de LlamaPi: https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi
- Wiki de Firefly sobre RK1820/RK1828: https://wiki.t-firefly.com/en/AIO-GS1N2-RK182X/ai_rk182x.html
- Repositorio RKNN3-Toolkit: https://github.com/airockchip/rknn3-toolkit
- Repositorio RKNN3-Model-Zoo: https://github.com/airockchip/rknn3-model-zoo
