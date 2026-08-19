# t-firefly/qwen3-1.7b-rknn3-rk1828

## Resumen

El modelo `t-firefly/qwen3-1.7b-rknn3-rk1828` es una conversión del modelo Qwen3-1.7B, desarrollado originalmente por el equipo Qwen, adaptado por Firefly AI Team para su ejecución en el coprocesador de IA RK1828 de Rockchip. Se trata de un modelo de generación de texto ligero, con 1.7 mil millones de parámetros, diseñado para tareas de instrucción, diálogo, código y razonamiento, y que soporta tanto modo de pensamiento como modo directo. La conversión está optimizada para despliegue en entornos de borde (edge AI) mediante la herramienta LlamaPi, lo que permite ejecutar el modelo en hardware de bajo consumo sin depender de la nube.

La relevancia de este modelo radica en su capacidad para llevar modelos de lenguaje de alto rendimiento a dispositivos embebidos, concretamente al coprocesador RK1828, que se integra con un SoC RK3588 como host. Esta distribución facilita la ejecución local de asistentes conversacionales y herramientas de razonamiento en entornos con recursos limitados, manteniendo la licencia Apache 2.0 y el formato GGUF para su integración en el ecosistema Llama. El repositorio, con 220 descargas y una actualización reciente, se presenta como una solución práctica para desarrolladores que buscan desplegar IA generativa en hardware de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Qwen3) |
| Parametros totales | 1.7 mil millones (1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-1.7B soporta hasta 32K tokens) |
| Tipos de cuantizacion | No disponible (el tamano del repo, 1.8 GB, sugiere cuantizacion de 8 bits, no confirmado) |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido a formato RKNN3 para RK1828) |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer causal ligero de la familia Qwen3, que incorpora un mecanismo de pensamiento híbrido: puede operar en modo "thinking" (razonamiento paso a paso) o en modo directo (respuesta inmediata). La arquitectura es densa, con 1.7B de parámetros, y ha sido entrenada para seguir instrucciones, mantener diálogos, generar código y resolver problemas de razonamiento. El entrenamiento original se realizó con un corpus multilingüe que cubre más de 100 idiomas, aunque los detalles específicos de composición del dataset (número de tokens, metodología de alineación como RLHF o DPO) no se han publicado en la información disponible.

La conversión realizada por Firefly AI Team no implica un reentrenamiento, sino una adaptación técnica de los pesos al formato RKNN3, específico para el coprocesador RK1828. Esta conversión se lleva a cabo mediante el RKNN3-Toolkit, que optimiza el modelo para la inferencia en el hardware de Rockchip. No se documentan innovaciones técnicas adicionales en la conversión, más allá de la propia optimización para el hardware.

## Capacidades

- Generación de texto conversacional y de instrucción: el modelo está diseñado para mantener diálogos multi-turno y responder a instrucciones complejas.
- Razonamiento y modo de pensamiento: soporta un modo de razonamiento explícito (thinking) que permite resolver problemas paso a paso antes de emitir la respuesta final.
- Generación de código: el modelo base Qwen3-1.7B incluye capacidades de generación y comprensión de código, aunque no se detallan casos específicos en la información proporcionada.
- Multilingüe: soporta más de 100 idiomas y dialectos, lo que lo hace adecuado para aplicaciones internacionales.
- Despliegue en borde: optimizado para ejecución en el coprocesador RK1828, con integración en la herramienta LlamaPi para gestión de descarga y ejecución.
- No se confirma soporte explícito de tool calling, agentes o visión en la información disponible, aunque el modelo base podría incluir algunas de estas capacidades.

## Casos de uso

- Asistentes conversacionales en dispositivos embebidos: el modelo puede gestionar diálogos multi-turno en tiempo real en un coprocesador RK1828, ideal para asistentes de voz o kioscos interactivos sin conexión a la nube.
- Generación de código en entornos de desarrollo sin conexión: al ejecutarse localmente, permite sugerencias de código y autocompletado en IDEs o herramientas de línea de comandos en hardware de bajo consumo.
- Razonamiento en sistemas de automatización industrial: el modo de pensamiento permite que el modelo analice datos de sensores o logs de máquinas y genere diagnósticos o recomendaciones en tiempo real.
- Traducción y procesamiento de texto multilingüe: con soporte para más de 100 idiomas, es útil para aplicaciones de traducción automática o análisis de texto en dispositivos de borde.
- Educación y tutoría interactiva: el modelo puede actuar como tutor personalizado en dispositivos educativos, resolviendo dudas de matemáticas, programación o idiomas sin latencia de red.
- Chatbots de atención al cliente en dispositivos locales: se puede integrar en sistemas de punto de venta o terminales de autoservicio para ofrecer respuestas a consultas frecuentes, manteniendo la privacidad al no enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento (como MMLU, HumanEval o GSM8K) para esta conversión específica ni para el modelo base. Se recomienda consultar la documentación del modelo Qwen3-1.7B original para obtener datos de referencia, aunque no se dispone de comparaciones directas en este repositorio.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en el coprocesador de IA RK1828 de Rockchip, que se integra típicamente con un SoC RK3588 como host.
- La VRAM estimada no está especificada, pero el tamaño del repositorio (1.8 GB) sugiere que la memoria requerida en el coprocesador es de aproximadamente 2 GB, asumiendo una cuantización de 8 bits.
- No se detalla compatibilidad con GPUs de consumo (como RTX 4090 o A100); el modelo es específico para el hardware RK1828.
- El despliegue se realiza mediante la herramienta LlamaPi, que gestiona la descarga, carga y ejecución del modelo. La conversión se realiza con el RKNN3 Toolkit en un PC y luego se despliega en el dispositivo.
- No se proporcionan datos de latencia o throughput. La herramienta LlamaPi y la documentación de RKNN3 pueden ofrecer información adicional, pero no está incluida en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para el RK1828 en la información proporcionada. La comparación más directa sería con el modelo base Qwen3-1.7B original, que comparte las mismas capacidades pero no está optimizado para el hardware de Rockchip. Otras alternativas de tamaño similar (como Llama 3.2 1B o Qwen2.5-1.5B) podrían ser comparables en cuanto a parámetros, pero no se conocen versiones convertidas para RK1828 ni datos de rendimiento relativos en este contexto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-1.7B (original) | 1.7B | Hasta 32K tokens | Apache-2.0 | Hugging Face, ModelScope |
| t-firefly/qwen3-1.7b-rknn3-rk1828 | 1.7B | No disponible | Apache-2.0 | Hugging Face, RK1828 |
| Llama 3.2 1B | 1.2B | 128K tokens | Llama 3.2 License | Hugging Face |

## Limitaciones y advertencias

- Al ser una conversión técnica, el modelo hereda las limitaciones del modelo base Qwen3-1.7B, incluyendo posibles sesgos en los datos de entrenamiento y riesgo de alucinaciones en tareas de generación.
- La longitud de contexto no está confirmada para esta versión específica; se recomienda verificar el comportamiento en el hardware objetivo antes de usarlo en producción.
- La información sobre el número de tokens de entrenamiento y el método de alineamiento (RLHF/DPO) no está disponible, lo que dificulta evaluar la calidad de las respuestas.
- El modelo está optimizado exclusivamente para el coprocesador RK1828, por lo que no es compatible con otras plataformas sin una reconversión mediante el RKNN3-Toolkit.
- Aunque la licencia Apache-2.0 permite uso comercial, los nombres y marcas de Qwen y Firefly pertenecen a sus respectivos propietarios y deben usarse según sus términos.
- No se proporcionan garantías de rendimiento ni soporte técnico por parte del autor del repositorio, más allá de la documentación de la herramienta LlamaPi.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t-firefly/qwen3-1.7b-rknn3-rk1828
- Modelo base Qwen3-1.7B (Hugging Face): https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Qwen3-1.7B (ModelScope): https://modelscope.cn/models/Qwen/Qwen3-1.7B
- Documentación de LlamaPi: https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi
- RKNN3 Toolkit (GitHub): https://github.com/airockchip/rknn3-toolkit
- RKNN3 Model Zoo (GitHub): https://github.com/airockchip/rknn3-model-zoo
- Wiki de Firefly sobre RK1820/RK1828: https://wiki.t-firefly.com/en/AIO-GS1N2-RK182X/ai_rk182x.html
