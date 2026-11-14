# wingmanllc/WINGMAN-OPENW.2.6-4B

## Resumen

WINGMAN-OPENW.2.6-4B es un modelo de lenguaje compacto de 4.112.079.360 parámetros publicado por Wingman LLC y orientado específicamente a tareas de ingeniería de software y flujos agénticos: generación y revisión de código, function calling, uso de herramientas MCP y navegación web automatizada. Se distribuye exclusivamente en formato GGUF (cuantización Q4_1) bajo licencia Apache-2.0, lo que facilita su ejecución local con llama.cpp tanto en CPU como en GPU de consumo.

El interés del modelo reside en su relación entre tamaño y rendimiento en tareas agénticas: según la model card del autor, con solo 4B parámetros supera en SWE Pro (54,3), BFCL-V4 (71,8), τ³-bench (34,7), MCP-Atlas (62,4) y BrowseComp (53,1) a modelos notablemente mayores como Qwen3.5-9B y Gemma4-12B. Esa combinación de tamaño reducido y capacidades de tool use lo posiciona como candidato para despliegues locales de agentes de código sin depender de infraestructura en la nube.

La información pública disponible es limitada: la model card no detalla la arquitectura interna, la composición del dataset de entrenamiento ni la longitud de contexto nativa, y no se han publicado resultados de benchmarks independientes. Los datos de rendimiento proceden exclusivamente del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 4B parámetros; detalles no publicados) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 8192`) |
| Tipos de cuantizacion | Q4_1 (único archivo publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo más allá de su naturaleza de transformer de 4B parámetros. La model card no especifica si emplea atención completa, atención lineal, mezcla de expertos ni ninguna otra innovación estructural, y tampoco detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o entrenamiento por refuerzo orientado a agentes.

Lo que sí documenta el autor es el enfoque funcional: el modelo está optimizado para coding y workflows agénticos, con soporte de plantilla de chat integrada (se recomienda `--jinja` en llama.cpp) y compatibilidad con endpoints OpenAI a través de `llama-server`. La distribución en un único GGUF Q4_1 de aproximadamente 2,6 GB sugiere un proceso de cuantización estándar de llama.cpp sobre los pesos originales, que no se distribuyen en safetensors en este repositorio.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat integrada.
- Generación, revisión y depuración de código en tareas de ingeniería de software (SWE Pro).
- Function calling estructurado (BFCL-V4) y uso de herramientas MCP (MCP-Atlas).
- Razonamiento agéntico multi-paso y ejecución de tareas de agente general (τ³-bench).
- Navegación web automatizada como agente (BrowseComp).
- Asistencia personal en flujos agénticos (PAgentBench).
- Razonamiento con herramientas en tareas de conocimiento experto (HLE con tools).
- Razonamiento sobre contexto largo (AA-LCRv1.1).
- Compatibilidad con API OpenAI mediante `llama-server` (`/v1/chat/completions`).

## Casos de uso

- Agente de código en local: el modelo puede integrarse en un flujo de edición de repositorios (leer archivos, proponer parches, ejecutar tests vía tool calling) ejecutándose en una estación de trabajo con GPU de consumo, sin enviar código a servicios externos.
- Automatización de revisión de pull requests: con soporte de function calling puede consultar el diff, ejecutar linters y publicar comentarios a través de herramientas MCP, aprovechando su puntuación en SWE Pro y BFCL-V4.
- Agente de navegación web: su resultado en BrowseComp (53,1) lo hace adecuado para tareas de extracción y verificación de información en páginas web mediante herramientas de scraping controladas.
- Asistente personal con herramientas: con 74,1 en PAgentBench puede gestionar calendario, correo o tareas domésticas de automatización mediante llamadas a funciones, siempre con validación humana en acciones destructivas.
- Servidor local compatible con OpenAI: desplegado con `llama-server --jinja`, puede sustituir a APIs remotas en prototipos de agentes que ya usan el esquema `/v1/chat/completions`, reduciendo coste y latencia de red.
- Automatización de soporte técnico interno: conversaciones multi-turno sobre documentación y código de una empresa, con acceso a herramientas de búsqueda internas vía MCP, ejecutándose en hardware propio.
- Entornos con requisitos de privacidad: al ser Apache-2.0 y ejecutarse íntegramente en local (CPU o GPU), es apto para organizaciones que no pueden enviar datos a proveedores cloud.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (mayor es mejor):

| Benchmark | Enfoque | WINGMAN-OPENW.2.6-4B | Qwen3.5-9B | Qwen3.5-4B | Gemma4-12B | Gemma4-F4B |
|---|---|---:|---:|---:|---:|---:|
| SWE Pro | Ingeniería de software | 54,3 | 33,8 | 29,4 | 21,9 | 4,0 |
| BFCL-V4 | Function calling | 71,8 | 66,1 | 50,3 | 37,4 | 47,0 |
| τ³-bench | Agente general | 34,7 | 9,3 | 6,7 | 13,3 | 10,1 |
| MCP-Atlas | Uso de herramientas MCP | 62,4 | 47,4 | 40,8 | 30,5 | 15,0 |
| BrowseComp | Navegación web | 53,1 | 8,3 | 14,3 | 10,0 | 8,3 |
| PAgentBench | Asistente personal | 74,1 | 53,8 | 51,4 | 51,8 | 37,0 |
| HLE (con tools) | Conocimiento experto | 36,9 | 17,9 | 20,2 | 19,0 | 10,1 |
| AA-LCRv1.1 | Razonamiento contexto largo | 67,3 | 70,0 | 63,0 | 63,7 | 32,0 |

No se han publicado resultados de benchmarks independientes en la información disponible; todas las cifras proceden del autor. En AA-LCRv1.1 el modelo queda por debajo de Qwen3.5-9B (67,3 frente a 70,0).

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_1 ocupa aproximadamente 2,6 GB, por lo que con contexto moderado (8K tokens) el consumo total se sitúa en torno a 3-4 GB de memoria.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM puede ejecutarlo con `-ngl 99`; una RTX 3060, RTX 4060, RTX 4090 o superior ofrecen margen amplio. En A100/H100 el modelo queda infrautilizado y solo tiene sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; también funciona en CPU pura eliminando `-ngl 99`.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja` para plantilla de chat y API compatible con OpenAI; `llama-cli -cnv` para chat interactivo). No se distribuyen pesos en otros formatos, por lo que vLLM o TGI no son opciones directas con los archivos publicados.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE Pro | BFCL-V4 | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| WINGMAN-OPENW.2.6-4B | 4,1B | no disponible | 54,3 | 71,8 | Apache-2.0 | GGUF Q4_1 |
| Qwen3.5-4B | ~4B | no disponible | 29,4 | 50,3 | no disponible | no disponible |
| Qwen3.5-9B | ~9B | no disponible | 33,8 | 66,1 | no disponible | no disponible |
| Gemma4-12B | ~12B | no disponible | 21,9 | 37,4 | no disponible | no disponible |

Según los datos del autor, WINGMAN-OPENW.2.6-4B supera a los tres modelos comparables en SWE Pro, BFCL-V4, τ³-bench, MCP-Atlas, BrowseComp, PAgentBench y HLE con herramientas, pese a tener menos parámetros. La única métrica donde cede es AA-LCRv1.1 frente a Qwen3.5-9B. No se dispone de información sobre contexto nativo ni licencia de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo de 4B parámetros puede cometer errores factuales; el propio autor recomienda verificar salidas importantes y revisar el código generado antes de ejecutarlo.
- Solo soporta inglés según la model card; no se declara soporte multilingüe.
- Longitud de contexto nativa no documentada; los ejemplos usan 8K tokens y el autor sugiere reducir `-c` si hay problemas de memoria.
- Solo se publica una cuantización Q4_1, lo que limita la precisión frente a pesos de mayor rango; no hay safetensors ni versiones Q8/FP16 en el repositorio.
- Los benchmarks proceden exclusivamente del autor y no han sido verificados de forma independiente; conviene tratarlos con cautela.
- No se documentan sesgos conocidos, composición del dataset ni procesos de alineación, lo que dificulta evaluar riesgos de sesgo.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero no hay garantías del autor sobre idoneidad para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de su comportamiento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wingmanllc/WINGMAN-OPENW.2.6-4B
- Perfil del autor: https://huggingface.co/wingmanllc
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
