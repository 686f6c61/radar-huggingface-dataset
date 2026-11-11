# turtler12/onetriangle-qwen3-1.7b-to-8b-prefill-mapper

## Resumen

OneTriangle Qwen3 1.7B → 8B mapper es un artefacto de pesos en formato safetensors publicado por el usuario turtler12 bajo licencia MIT. No se trata de un modelo de lenguaje completo, sino de un mapeador de prefill diseñado para trasladar el estado de caché KV generado por Qwen/Qwen3-1.7B (revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) hacia el espacio de Qwen/Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`). El fichero principal, `G2n8sup1k.safetensors`, ocupa 2,4 GB en el repositorio.

El propósito declarado es servir como artefacto canónico de prefill mapeado para la release pública de Docker de OneTriangle. Es decir, el mapeador permite reutilizar el trabajo de prefill realizado por el modelo pequeño como estado inicial del modelo grande, lo que en teoría reduce el coste computacional de arrancar inferencia con contexto largo en Qwen3-8B. El runtime de OneTriangle verifica el hash SHA-256 del fichero, las identidades de modelo embebidas, las revisiones fijadas y un digest semántico antes de servir peticiones.

La relevancia de este artefacto es acotada y específica: no es un modelo entrenado para generar texto, sino un componente de infraestructura para un pipeline de inferencia concreto. No se han publicado datos sobre arquitectura interna del mapeador, composición de datos de entrenamiento ni resultados de benchmarks. Los pesos de los modelos Qwen3 subyacentes no se incluyen en el repositorio y deben descargarse por separado desde sus repositorios oficiales, quedando sujetos a sus propios términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de mapeo de caché KV para Qwen3) |
| Parametros totales | no disponible (el fichero pesa 2,4 GB; no es un modelo generativo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`G2n8sup1k.safetensors`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del mapeador. Por el nombre y las etiquetas (`kv-cache`, `prefill`, `qwen3`), se infiere que transforma representaciones de caché KV entre dos modelos de la familia Qwen3 con distinta dimensión: Qwen3-1.7B como origen y Qwen3-8B como destino. No se especifica si el mapeo es lineal, mediante proyecciones aprendidas, atención cruzada u otro mecanismo, ni si se entrenó con datos supervisados, destilación o ajuste directo.

No se han publicado detalles sobre el dataset de entrenamiento, número de tokens, composición, ni si hubo RLHF, DPO o alguna fase de alineación. Tampoco se documentan innovaciones técnicas más allá del propio concepto de mapeo de prefill entre modelos de distinto tamaño. El artefacto incluye metadatos de integridad (SHA-256 `9cb42f6e83a5804c8e33966d579ffcd41b9ad4ab82df7f1d8efc5a5179e4fab6` y digest semántico `b77057a5a59c88db85b6858d0fd77fdea9fcf667b292248e63742399beaa215a`) y está pensado para ser consumido por el runtime de OneTriangle, no cargado manualmente.

## Capacidades

- Mapeo de caché KV de prefill desde Qwen3-1.7B hacia Qwen3-8B.
- Integración con el runtime Docker de OneTriangle, que valida hash, identidades de modelo, revisiones y digest semántico.
- No genera texto por sí mismo: es un componente auxiliar de un pipeline de inferencia.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües propias.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Aceleración de arranque de inferencia con contexto largo: reutilizar el prefill calculado por Qwen3-1.7B para inicializar el estado de Qwen3-8B, reduciendo el coste de procesar prompts extensos en el modelo grande.
- Despliegue en el stack Docker de OneTriangle: usar el artefacto como pieza canónica dentro de la release pública, con verificación de integridad previa a servir peticiones.
- Investigación sobre transferencia de estado entre modelos de distinta escala: estudiar hasta qué punto el prefill de un modelo pequeño es aprovechable por uno grande de la misma familia.
- Prototipado de pipelines de dos etapas (modelo pequeño para prefill, modelo grande para decodificación) en entornos controlados.
- Validación de integridad de artefactos en producción: el runtime comprueba hash y digest semántico, útil en pipelines con requisitos de reproducibilidad.
- Experimentación con caché KV compartida en despliegues multi-modelo sobre la misma familia Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 2,4 GB en disco; el fichero `G2n8sup1k.safetensors` debe almacenarse junto al runtime de OneTriangle.
- VRAM estimada para inferencia: no disponible. Depende de los pesos de Qwen3-1.7B y Qwen3-8B, que se descargan por separado.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica explícitamente que debe usarse el paquete Docker complementario de OneTriangle en lugar de cargar el fichero manualmente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen artefactos públicos comparables de mapeo de prefill entre Qwen3-1.7B y Qwen3-8B, ni se han publicado métricas que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no debe esperarse que produzca texto, código ni razonamiento por sí mismo.
- El autor desaconseja cargar el fichero manualmente; el uso previsto requiere el runtime Docker de OneTriangle, que valida integridad y revisiones.
- Los pesos de Qwen3-1.7B y Qwen3-8B no se incluyen y están sujetos a sus propios términos, distintos de la licencia MIT del mapeador.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del mapeador; al no generar texto, estos riesgos recaen sobre los modelos Qwen3 subyacentes.
- No hay información sobre robustez del mapeo fuera de las revisiones fijadas; cambios en las revisiones de Qwen3 podrían invalidar la compatibilidad.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica adopción muy limitada y poca validación comunitaria.
- No se documentan garantías de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/turtler12/onetriangle-qwen3-1.7b-to-8b-prefill-mapper
- Modelo origen Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo destino Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio Docker de OneTriangle: no disponible (no se proporciona URL en la información)
