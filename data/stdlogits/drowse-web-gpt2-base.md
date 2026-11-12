# stdlogits/drowse-web-gpt2-base

## Resumen

`stdlogits/drowse-web-gpt2-base` es una conversión del modelo GPT-2 base de OpenAI (openai-community/gpt2) preparada específicamente para ejecutarse en el navegador mediante WebGPU. No es un checkpoint de Transformers al uso: el repositorio contiene pesos convertidos, tokenizer, una biblioteca de modelo en WebAssembly con los hooks de instrumentación de drowse compilados y un paquete de geometría (estadísticas neutras y variedades de conceptos por defecto). Está desarrollado por stdlogits como artefacto de despliegue para drowse.ai, una edición en navegador de la herramienta de interpretabilidad drowse.

El modelo resuelve un problema muy concreto: permitir leer y dirigir el flujo residual de un transformer pequeño mientras genera, directamente en el dispositivo del usuario, sin backend ni GPU dedicada. Para ello conserva la arquitectura original de GPT-2 (transformer decoder-only de 124 millones de parámetros, contexto de 1024 tokens) y añade puntos de enganche en el runtime (`drowse-web-runtime-v2`, ABI de hooks `block-sites-v5`, perfil `standard-v4-residual`).

Es relevante para quien investigue interpretabilidad mecanicista o quiera experimentar con steer de activaciones en el navegador con coste cero de infraestructura. Conviene subrayar que es un modelo base de completado crudo, sin ajuste por instrucciones, y que sus pesos se distribuyen en float32 sin cuantizar, lo que da un tamaño de repositorio de 0,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 original) |
| Parametros totales | 124 millones (GPT-2 base; no confirmado explícitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | float32 sin cuantizar (etiqueta `q0f32`); no se documentan otras variantes |
| Idiomas soportados | no disponible (el modelo base GPT-2 está entrenado principalmente en inglés) |
| Licencia | mixta por componente (`mixed-artifact-licenses`); detalle en LICENSES.md |
| Formato de pesos | artefactos de navegador para MLC LLM/WebLLM (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 base: un transformer decoder-only con atención multi-cabeza causal y capas de feed-forward densas. No hay innovaciones de arquitectura propias; la aportación de este repositorio está en el runtime. Los pesos se compilan con MLC LLM (con un commit base fijado) y se empaquetan como biblioteca WebAssembly ejecutable mediante WebGPU, con hooks insertados en el flujo residual para que drowse pueda leer y modificar activaciones durante la generación.

No se ha realizado entrenamiento adicional: el modelo deriva directamente de `openai-community/gpt2` en la revisión `607a30d783dfa663caf39e06633721c8d4cfcd7e`. No hay datos de RLHF, DPO ni ajuste por instrucciones. La reproducibilidad está documentada: `drowse-build.json` registra los ficheros fuente, el commit de MLC LLM y el hash de cada overlay del compilador, y `hosted-artifacts.json` lista cada fichero con su digest SHA-256.

## Capacidades

- Generación de texto por completado crudo (raw completion), sin formato de chat ni seguimiento de instrucciones.
- Lectura del flujo residual en tiempo de generación mediante hooks del runtime (`block-sites-v5`).
- Steer de activaciones: modificación de representaciones internas durante la decodificación.
- Ejecución en el dispositivo vía WebGPU, sin servidor de inferencia.
- Paquete de geometría base con estadísticas neutras y variedades de conceptos por defecto por contexto.
- No soporta tool calling, function calling ni razonamiento multi-paso de agentes.
- Capacidades multilingües no documentadas; el modelo base está orientado al inglés.
- No dispone de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en interpretabilidad mecanicista: permite inspeccionar activaciones del flujo residual capa a capa mientras el modelo genera, sin montar infraestructura de GPU, gracias a los hooks compilados en el runtime.
- Experimentos de steer de conceptos: el paquete de geometría por defecto permite aplicar direcciones de concepto y observar el efecto en la salida, útil para validar hipótesis sobre representaciones lineales.
- Docencia y demos interactivas: al ejecutarse en WebGPU dentro del navegador, se puede mostrar el funcionamiento interno de un transformer en clase o en un taller sin instalación local.
- Prototipado rápido de interfaces de interpretabilidad: sirve como banco de pruebas para herramientas que lean y modifiquen activaciones antes de escalar a modelos mayores.
- Evaluación de técnicas de lectura del flujo residual: con contexto de 1024 tokens y pesos float32, es un entorno controlado y reproducible (digests SHA-256 por fichero) para comparar métodos.
- Aplicaciones educativas de generación de texto offline: completado de texto local en el navegador sin enviar datos a un servidor, adecuado para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ejecutarse en el navegador con WebGPU, no requiere VRAM de GPU dedicada en el sentido tradicional; el coste recae en la memoria del dispositivo y en la GPU integrada o discreta expuesta por el navegador.
- Tamaño de pesos: float32 sin cuantizar, con repositorio de 0,6 GB; la huella en memoria del runtime será del orden de esa cifra más el overhead de WebAssembly y del grafo compilado.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable en el navegador (integradas modernas y discretas); no se documentan modelos concretos.
- No cabe plantear despliegue con vLLM, llama.cpp, Ollama o TGI: los artefactos son específicos de MLC LLM/WebLLM para navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stdlogits/drowse-web-gpt2-base | 124 M (GPT-2 base) | 1024 | Interpretabilidad y steer en navegador (WebGPU) | Mixta por componente | Hugging Face, instalación vía drowse.ai |
| openai-community/gpt2 | 124 M | 1024 | Modelo base de texto | MIT (según el repositorio original) | Hugging Face, Transformers |
| Modelos GPT-2 convertidos a MLC LLM/WebLLM | 124 M | 1024 | Inferencia en navegador | Según el conversor y el modelo base | Hugging Face / catálogo WebLLM |

La diferencia principal frente a GPT-2 original y a las conversiones estándar para WebLLM es la instrumentación: este repositorio incluye hooks de lectura y steer del flujo residual y un paquete de geometría, y está pensado para instalarse mediante el catálogo firmado de drowse.ai en lugar de cargarse con `transformers`.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue órdenes ni mantiene formato de chat; produce completados crudos.
- Riesgo alto de alucinación y de contenido incoherente o sesgado, inherente a GPT-2 base y a su corpus de entrenamiento predominantemente inglés.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el rendimiento fuera del inglés será previsiblemente pobre.
- La licencia es mixta y se aplica por componente (pesos, runtime, paquetes); es obligatorio revisar LICENSES.md antes de cualquier uso, incluido el comercial.
- No es un checkpoint de Transformers: no se puede cargar con `AutoModelForCausalLM`; requiere el runtime de drowse y su catálogo firmado.
- El repositorio no incluye lens ni units packs; solo el paquete de geometría base, lo que limita los análisis que dependan de esas herramientas.
- Uso en producción no recomendado para tareas de calidad: su finalidad es la experimentación en interpretabilidad, no el servicio a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stdlogits/drowse-web-gpt2-base
- Modelo base: https://huggingface.co/openai-community/gpt2/tree/607a30d783dfa663caf39e06633721c8d4cfcd7e
- Licencias por componente: https://huggingface.co/stdlogits/drowse-web-gpt2-base/blob/main/LICENSES.md
- drowse.ai: https://drowse.ai
- Repositorio drowse: https://github.com/stdlogits/drowse
- Repositorio de la edición de navegador: https://github.com/stdlogits/drowse.ai
