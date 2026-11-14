# zsumagicpig/NanoAI-Qwen3.5-Q4_0

## Resumen

NanoAI-Qwen3.5-Q4_0 es un paquete de pesos cuantizados en formato Q4_0 de los modelos Qwen3.5-0.8B y Qwen3.5-2B del equipo Qwen, preparado por el usuario zsumagicpig para su uso con la librería y la aplicación Android NanoAI. No se trata de un modelo entrenado desde cero ni de un fine-tune con datos propios: es una conversión de los checkpoints originales a un formato de inferencia local optimizado para dispositivos móviles, con pesos de texto, un manifiesto de tensores y un tokenizador binario.

El interés del paquete reside en su orientación a la inferencia en el propio dispositivo (Android), un escenario en el que el tamaño y la cuantización son determinantes. Con un repositorio de 1,5 GB y cuantización de 4 bits, el objetivo es ejecutar modelos de la familia Qwen3.5 en hardware con recursos limitados sin depender de servicios en la nube.

La información publicada por el autor es muy escasa: no se detallan parámetros exactos, longitud de contexto, idiomas soportados ni resultados de evaluación. La model card se limita a indicar el origen de los pesos, la licencia Apache 2.0 heredada de Qwen y las instrucciones de instalación en la aplicación NanoAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de Qwen3.5-0.8B / Qwen3.5-2B; no detallada en la informacion proporcionada) |
| Parametros totales | no disponible con precision; los modelos base son de 0,8B y 2B parametros |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | paquete NanoAI: pesos de texto cuantizados, manifiesto de tensores y tokenizador binario (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El paquete no incluye información sobre la arquitectura interna de los modelos base. Por la denominación de los checkpoints de origen (Qwen3.5-0.8B y Qwen3.5-2B) se trata de modelos de la familia Qwen3.5, pero la model card no especifica si emplean transformer denso, mezcla de expertos, atención lineal u otra variante, ni detalla el número de capas, dimensiones ocultas o cabezas de atención.

Tampoco se documentan los datos de entrenamiento: no se indica el volumen de tokens, la composición del corpus ni si hubo etapas de ajuste por instrucciones, RLHF o DPO. La conversión realizada por el proyecto NanoAI se limita a transformar los pesos originales a cuantización Q4_0 y a empaquetarlos junto con el manifiesto de tensores y el tokenizador binario para la inferencia local en la aplicación Android. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras) más allá de la propia cuantización.

## Capacidades

- Generación de texto: según la model card, cada variante "responde con texto", lo que confirma la capacidad básica de generación.
- Conversión de pesos y tokenizador: el paquete incluye los tres componentes necesarios (pesos, manifiesto y tokenizador binario) para la inferencia local en NanoAI.
- Inferencia en dispositivo: diseñado para ejecutarse localmente en Android a través de la aplicación NanoAI.
- Razonamiento, código, matemáticas, visión, tool calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).

## Casos de uso

- Asistente de texto sin conexión en Android: el paquete está pensado para descargarse desde el gestor de modelos de la aplicación NanoAI y responder con texto en el propio dispositivo, sin enviar datos a servidores externos. Es adecuado por su cuantización Q4_0 y su tamaño reducido (1,5 GB de repositorio).
- Prototipado de aplicaciones móviles con IA local: un desarrollador puede integrar el paquete en una app Android basada en NanoAI para validar flujos de conversación y generación de texto antes de optar por modelos mayores o servicios en la nube.
- Escenarios con requisitos de privacidad: al ejecutarse localmente, el texto del usuario no sale del dispositivo, lo que resulta útil para borradores, notas o consultas sensibles en entornos sin conectividad.
- Distribución de modelos en entornos con ancho de banda limitado: el empaquetado compacto en Q4_0 facilita la descarga y el almacenamiento en dispositivos móviles con poco espacio libre.
- Evaluación comparativa de cuantizaciones: sirve como referencia práctica para medir la calidad y la velocidad de un modelo de 0,8B o 2B en 4 bits frente a otras variantes, dentro del ecosistema NanoAI.
- Importación manual en pipelines de prueba: la model card describe cómo importar manualmente los tres archivos de un mismo directorio, lo que permite automatizar pruebas de integración en un entorno de desarrollo Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 1,5 GB y la cuantización es Q4_0, por lo que el consumo de memoria será del orden de esa cifra más el overhead de la aplicación.
- GPU recomendadas: no disponible; el destino declarado es Android, no GPU de escritorio o servidor.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para RTX 4090, A100, H100 ni similares.
- Opciones de despliegue: aplicación NanoAI para Android (gestor de modelos con descarga o importación manual de los tres archivos). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| NanoAI-Qwen3.5-Q4_0 (este paquete) | 0,8B y 2B (base) | no disponible | Q4_0 | Apache 2.0 | paquete NanoAI para Android |
| Qwen/Qwen3.5-0.8B (original) | 0,8B | no disponible | pesos completos | Apache 2.0 | safetensors u original de Qwen (no detallado) |
| Qwen/Qwen3.5-2B (original) | 2B | no disponible | pesos completos | Apache 2.0 | safetensors u original de Qwen (no detallado) |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Información muy incompleta: no se documentan arquitectura, contexto, idiomas, benchmarks ni requisitos de hardware, lo que dificulta evaluar su idoneidad en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha publicado ninguna evaluación que lo cuantifique.
- Sesgos: no documentados.
- Idiomas: no declarados; no puede confirmarse el soporte del castellano ni de otras lenguas.
- Licencia: Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones de los modelos base de Qwen y del propio proyecto NanoAI.
- Dependencia del ecosistema NanoAI: el formato no es safetensors ni GGUF, por lo que no es portable directamente a otras herramientas de inferencia.
- Importación manual: la model card advierte de que los tres archivos de un mismo directorio deben mantenerse juntos; una mezcla de archivos de variantes distintas puede impedir la carga.

## Enlaces

- [Hugging Face: zsumagicpig/NanoAI-Qwen3.5-Q4_0](https://huggingface.co/zsumagicpig/NanoAI-Qwen3.5-Q4_0)
- [Modelo base Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Modelo base Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
