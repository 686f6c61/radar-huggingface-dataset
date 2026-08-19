# t-firefly/qwen3.5-0.8b-rkllm-rk3588

## Resumen

Qwen3.5-0.8B es el miembro más pequeño de la familia Qwen3.5 de Alibaba, un modelo multimodal compacto que unifica comprensión de texto e imagen en un único modelo. Esta versión distribuida por Firefly AI Team es una conversión específica para la plataforma Rockchip RK3588, un SoC de gama media-alta con NPU de 6 TOPS, pensada para ejecución en dispositivos de borde (edge AI). El modelo se distribuye en formato RKLLM, el formato nativo de inferencia de Rockchip, y se despliega mediante la herramienta LlamaPi, que gestiona la descarga, carga y ejecución.

La relevancia de este modelo radica en que lleva capacidades multimodales de razonamiento, codificación y conversación a hardware de bajo consumo y coste, como placas de desarrollo y dispositivos embebidos. Con una arquitectura híbrida de gated delta networks, una ventana de contexto de hasta 262.000 tokens y soporte para 201 idiomas, ofrece una alternativa local y privada a los servicios en la nube para aplicaciones de visión y texto en tiempo real. La licencia Apache-2.0 facilita su uso comercial, aunque el modelo original mantiene sus propios términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de gated delta networks (transformador multimodal) |
| Parametros totales | 0,8 mil millones (aprox.) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | no disponible (formato RKLLM con cuantizacion interna no documentada) |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card del modelo original) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKLLM (formato propietario de Rockchip para ejecucion en NPU) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida de gated delta networks, una variante moderna de transformador que combina mecanismos de atención con capas de actualización delta controladas por compuertas, lo que mejora la eficiencia computacional respecto a los transformadores densos clásicos. Esta arquitectura permite mantener un contexto de 262K tokens con un presupuesto de memoria reducido, lo que lo hace adecuado para dispositivos de borde.

El entrenamiento del modelo original, realizado por el equipo Qwen, incluye datos multimodales (texto e imagen) y procesos de alineación con técnicas de RLHF y DPO, aunque los detalles exactos del dataset y el número de tokens no se han publicado en la información disponible. La conversión a RKLLM realizada por Firefly AI Team no modifica los pesos del modelo original; solo lo transpila al formato de inferencia de Rockchip para su ejecución en la NPU del RK3588. Según el repositorio de Qengineering, tras la conversión a RKNN (formato de cuantizacion de Rockchip), partes del modelo pueden ejecutarse en la NPU, mejorando la velocidad, mientras que el codificador de visión puede optimizarse por separado.

## Capacidades

- Generación de texto y razonamiento: respuestas conversacionales, resolución de problemas y razonamiento de varios pasos.
- Comprensión de imágenes: entrada de imágenes para responder preguntas visuales, describir contenido y realizar tareas de visión-lenguaje.
- Generación de código: soporte para tareas de programación, generación de funciones y depuración.
- Capacidades de agente y tool calling: el modelo original soporta invocación de herramientas y razonamiento multi-paso, aunque la versión RKLLM hereda estas capacidades del modelo base.
- Soporte multilingüe: 201 idiomas y dialectos, incluyendo el español, inglés, chino, entre otros.
- Modo conversacional: optimizado para interacción por turnos.

## Casos de uso

- **Asistente de visión en dispositivos embebidos**: una cámara conectada a un RK3588 puede usar este modelo para describir escenas, reconocer objetos o leer texto en imágenes en tiempo real, sin depender de la nube.
- **Chatbot de atención al cliente en kioscos**: el modelo gestiona conversaciones multi-turno con contexto largo (262K tokens) y puede mantener el hilo de la conversación durante sesiones prolongadas, adecuado para quioscos interactivos.
- **Generación de código en entornos de desarrollo locales**: un desarrollador puede usar el modelo para autocompletar código o explicar fragmentos, ejecutándose localmente en una placa de desarrollo sin enviar datos a servidores externos.
- **Sistema de control por voz para domótica**: el modelo interpreta comandos hablados convertidos a texto y ejecuta acciones en dispositivos del hogar, gracias a su capacidad de razonamiento y su pequeño tamaño para correr en hardware de consumo.
- **Análisis de documentos escaneados**: combinando la comprensión de imágenes con la generación de texto, el modelo puede extraer y resumir información de facturas, formularios o notas manuscritas en un dispositivo de oficina.
- **Educación interactiva**: un asistente educativo que responde preguntas de texto y de imágenes (por ejemplo, fotos de problemas matemáticos) en un dispositivo portátil de bajo coste, útil para entornos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión RKLLM. El modelo original Qwen3.5-0.8B, según la documentación de la familia, ha sido evaluado en tareas de razonamiento, codificación y visión, pero no se han proporcionado cifras concretas en los materiales revisados. Los datos de rendimiento del modelo convertido dependen de la configuración específica de la NPU del RK3588 y no están documentados.

## Requisitos de hardware

- **Plataforma objetivo**: SoC Rockchip RK3588, que incluye una NPU de 6 TOPS (INT8) y CPU de 4×Cortex-A76 + 4×Cortex-A55.
- **Memoria**: el tamaño del repositorio es de 1,6 GB, por lo que se estima que el modelo ocupa entre 1,5 y 2 GB en memoria. Un dispositivo con 4 GB o más de RAM es recomendable para el sistema operativo y la inferencia.
- **GPU**: no se requiere GPU; la ejecución se realiza en la NPU del RK3588.
- **Herramientas de despliegue**: LlamaPi (herramienta de Firefly) y el entorno de ejecución RKLLM de Rockchip. También se puede usar el kit de desarrollo RKNN para integraciones más personalizadas.
- **Latencia**: no se han publicado mediciones de latencia o throughput para esta conversión. Según referencias de modelos similares en la misma plataforma, la inferencia de modelos de 0.8B en la NPU puede alcanzar velocidades suficientes para uso interactivo en tiempo real, aunque el rendimiento exacto depende de la optimización del código y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (RKLLM) | 0.8B | 262K | Apache-2.0 | RKLLM | Conversión para RK3588 |
| Qwen3-0.6B | 0.6B | 32K | Apache-2.0 | Safetensors, GGUF | Modelo general |
| Qwen2.5-0.5B | 0.5B | 32K | Apache-2.0 | Safetensors, GGUF | Modelo general |
| Qwen3.5-0.8B (original) | 0.8B | 262K | Apache-2.0 | Safetensors | Modelo multimodal |

La comparación principal es con el modelo original Qwen3.5-0.8B, que se puede ejecutar en hardware convencional con frameworks como vLLM. La versión RKLLM está limitada a dispositivos con NPU Rockchip, pero ofrece la ventaja de un despliegue de bajo consumo y coste. Los modelos Qwen3-0.6B y Qwen2.5-0.5B son alternativas de tamaño similar, pero no son multimodales y tienen una ventana de contexto mucho menor (32K frente a 262K). No se dispone de datos de rendimiento comparativos entre estas opciones.

## Limitaciones y advertencias

- **Alucinaciones**: como modelo de lenguaje generativo, puede producir respuestas incorrectas o inventadas, especialmente en contextos no cubiertos por sus datos de entrenamiento.
- **Precisión de la cuantización**: la conversión a RKLLM puede implicar una pérdida de precisión respecto al modelo original en formato de punto flotante, lo que puede afectar a la calidad de las respuestas.
- **Restricciones de hardware**: el modelo solo se ejecuta en dispositivos con RK3588 (o compatibles con RKLLM); no funciona en GPUs o CPU de propósito general sin una conversión adicional.
- **Limitaciones de contexto**: aunque la ventana teórica es de 262K tokens, en la práctica el hardware de borde puede tener limitaciones de memoria que reduzcan el contexto efectivo.
- **Licencia**: aunque el modelo se distribuye bajo Apache-2.0, el modelo original Qwen3.5-0.8B está sujeto a los términos de uso de Qwen, que pueden incluir restricciones de uso comercial en determinados escenarios (por ejemplo, para empresas con más de 100 millones de usuarios).
- **Falta de documentación**: no se han publicado detalles sobre el proceso de cuantización ni los resultados de rendimiento de la conversión, lo que dificulta la evaluación precisa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/t-firefly/qwen3.5-0.8b-rkllm-rk3588)
- [Modelo original en Hugging Face](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Modelo original en ModelScope](https://modelscope.cn/models/Qwen/Qwen3.5-0.8B)
- [Página de vLLM para Qwen3.5-0.8B](https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B)
- [Repositorio de Qengineering sobre Qwen3.5-0.8B-NPU](https://github.com/Qengineering/Qwen3.5-0.8B-NPU)
- [Documentación de LlamaPi](https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi)
