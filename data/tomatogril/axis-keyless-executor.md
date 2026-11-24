# Tomatogril/axis-keyless-executor

## Resumen

El repositorio `Tomatogril/axis-keyless-executor` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo contenido es una utilidad ejecutable para Windows de 64 bits, distribuida como archivo ZIP (`blox-fruits-script-keyless-2026-v1.2.2-win64.zip`, 4,8 MB) y orientada a la inyección de scripts en el videojuego Roblox. La model card se presenta como una página de descarga con enlaces a un repositorio de GitHub externo, contraseña de descompresión y avisos para desactivar las alertas de Windows Defender y SmartScreen.

El artefacto no dispone de pipeline declarado, no publica pesos, no documenta arquitectura de red neuronal, datos de entrenamiento ni parámetros. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`, `axis-keyless-executor`) confirman que el objeto alojado es software de escritorio, no un modelo de lenguaje. Las descargas y los "likes" registrados en el momento de la consulta son cero.

Desde la perspectiva de un blog técnico sobre IA open source, esta ficha debe leerse como una advertencia: el repositorio no es evaluable como modelo y presenta varios indicadores propios de distribución de software potencialmente malicioso (contraseña fija en el archivo comprimido para evadir análisis automatizados, instrucciones para ejecutar como administrador y para añadir exclusiones en el antivirus, enlaces de descarga que apuntan a un repositorio de GitHub distinto del declarado). No se recomienda su descarga ni su ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El repositorio no describe ninguna arquitectura de red neuronal, ni transformer, ni MoE, ni SSM, ni híbrida. No se documentan datos de entrenamiento, número de tokens, composición del corpus, ni fases de RLHF, DPO o ajuste por instrucciones. La model card describe funcionalidades de un ejecutable de escritorio (supuesto puente con la máquina virtual Luau de Roblox, editor Monaco integrado, adjunción multi-instancia y sincronización de offsets tras parches del cliente), sin ninguna relación con el entrenamiento de modelos.

Tampoco se especifican innovaciones técnicas verificables. Las cifras que aparecen en la model card (99,4 % de consistencia, sondeo a 215 Hz, latencia inferior a 38 ms, consumo menor de 35 MB de RAM) son afirmaciones del autor sin metodología, sin reproducibilidad y sin código fuente asociado, por lo que no pueden considerarse datos técnicos contrastados.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio, porque no existe un modelo de lenguaje subyacente.
- No hay soporte de tool calling ni de function calling en el sentido de un LLM.
- No hay soporte de agentes ni de razonamiento multi-paso.
- El artefacto declara, según su model card, funciones de inyección de scripts en Roblox, editor de scripts con resaltado de sintaxis y consola, y adjunción a varias instancias del cliente.
- Los idiomas listados en los metadatos corresponden a la ficha del repositorio, no a capacidades lingüísticas de un modelo.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA, ya que no lo es.
- Evaluación de riesgos de cadena de suministro: el repositorio puede emplearse como caso de estudio de artefactos que suplantan la apariencia de un modelo en Hugging Face para distribuir ejecutables.
- Análisis de ingeniería social: la model card ilustra técnicas de persuasión (insignias falsas de descargas y valoraciones, instrucciones para desactivar el antivirus) útiles en formación de seguridad.
- Auditoría de metadatos: sirve para ejemplificar la discrepancia entre los enlaces declarados (`heatherray496/axis-keyless-executor`) y los enlaces de descarga reales (repositorio `JisungDiaz447/...`).
- Concienciación sobre licencias: muestra cómo una licencia MIT declarada en metadatos no implica que el binario distribuido sea seguro ni auditable.
- No procede ningún caso de uso de inferencia, ajuste fino, RAG ni despliegue en producción de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas presentes en la model card son afirmaciones de rendimiento del ejecutable (consistencia del 99,4 %, sondeo a 215 Hz, latencia inferior a 38 ms, consumo inferior a 35 MB de RAM) sin metodología ni verificación independiente, por lo que no se recogen como benchmarks.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits, según la model card.
- CPU: procesadores x64 de Intel o AMD, según la model card.
- VRAM: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles como métricas verificables; las cifras del autor no son reproducibles.
- Tamaño del artefacto distribuido: 4,8 MB (ZIP), según la model card.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Frente a modelos open source reales (por ejemplo, familias tipo Llama, Mistral o Qwen), la comparación es improcedente: aquellos publican pesos en safetensors o GGUF, documentan parámetros y contexto, y permiten inferencia reproducible; este repositorio no ofrece nada de ello.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede evaluarse con benchmarks de LLM.
- La model card incluye instrucciones para ejecutar un binario como administrador y para añadir exclusiones en Windows Defender y SmartScreen, práctica habitual en la distribución de software potencialmente no deseado.
- El archivo ZIP está protegido con una contraseña fija (`2026`), técnica que dificulta el análisis automatizado por parte de antivirus y servicios de inspección.
- Los enlaces de descarga apuntan a un repositorio de GitHub (`JisungDiaz447/...`) distinto del repositorio declarado en la URL de Hugging Face (`heatherray496/axis-keyless-executor`), lo que impide verificar la procedencia y la integridad del binario.
- Las insignias de descargas (286K+) y valoración (4,9/5) de la model card no coinciden con las métricas reales del repositorio en Hugging Face (0 descargas, 0 likes).
- Uso comercial: la licencia MIT declarada en los metadatos no exime de responsabilidad sobre el contenido del binario ni garantiza su seguridad; además, la inyección de scripts en Roblox puede infringir los términos de servicio de la plataforma.
- Riesgo de seguridad: la ejecución de binarios sin código fuente ni firma verificable expone al usuario a malware, robo de credenciales y persistencia no autorizada.
- Sesgos y alucinación: no aplica en el sentido de un LLM, pero la documentación contiene afirmaciones no verificables que pueden inducir a error.
- Idiomas: los códigos de idioma de los metadatos no implican soporte lingüístico real del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tomatogril/axis-keyless-executor
- Repositorio de GitHub citado en la model card: https://github.com/heatherray496/axis-keyless-executor
- Repositorio de GitHub alternativo usado para la descarga: https://github.com/JisungDiaz447/blox-fruits-script-keyless-2026
- Enlace de descarga directa citado en la model card: https://github.com/JisungDiaz447/blox-fruits-script-keyless-2026/releases/download/v1.2.0/blox-fruits-script-keyless-2026-v1.2.2-win64.zip
