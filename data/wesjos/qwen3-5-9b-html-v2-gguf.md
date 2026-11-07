# wesjos/Qwen3.5-9B-HTML-v2-GGUF

## Resumen

Qwen3.5-9B-HTML-v2-GGUF es la distribucion cuantizada en formato GGUF del modelo wesjos/Qwen3.5-9B-HTML-v2, un ajuste fino de Qwen/Qwen3.5-9B especializado en la generacion de HTML estructurado para interfaces visuales. El autor, wesjos, ha entrenado el modelo para que produzca directamente un arbol DOM con clases CSS predefinidas (tarjetas, grids, tablas, callouts, steppers) a partir de una instruccion en lenguaje natural o de una imagen, lo que permite renderizar respuestas de un asistente como componentes visuales sin post-procesado.

El modelo parte de la arquitectura Qwen3_5ForConditionalGeneration, con 32 capas (24 de atencion lineal y 8 de atencion completa, con intervalo 4), hidden de 4096 y un contexto nativo de 262.144 tokens. El ajuste fino se realizo sobre el dataset wesjos/mario-html-sft y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial. El repositorio GGUF incluye cuantizaciones Q8_0 y Q4_K_M, ademas de un proyector de vision en BF16 necesario para la entrada de imagenes.

La relevancia actual del modelo radica en su enfoque "zero-system-prompt": no requiere un prompt de sistema que defina el contrato de salida, ya que el formato HTML esta internalizado en los pesos. Ademas, mantiene la "pureza de CoT", es decir, la traza de razonamiento previa a la respuesta contiene texto plano sin etiquetas HTML, lo que reduce el ruido y facilita la interpretacion del proceso de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer hibrido: 24 capas de atencion lineal + 8 de atencion completa, intervalo 4) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 B; el modelo base se reporta como 9,65 B en bf16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q8_0 (8,87 GiB), Q4_K_M (5,24 GiB); proyector de vision en BF16 (0,86 GiB) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B, un transformer con atencion hibrida: 24 de sus 32 capas emplean atencion lineal y 8 emplean atencion completa con un intervalo de 4, con un tamano de hidden de 4096. Esta combinacion busca reducir el coste computacional en contextos largos manteniendo la capacidad de atencion global en capas seleccionadas. El pipeline es image-text-to-text, por lo que el modelo acepta tanto texto como imagenes como entrada y genera HTML como salida.

El ajuste fino se realizo sobre el dataset wesjos/mario-html-sft, orientado a la generacion de interfaces HTML con un contrato de clases CSS concreto (ai-view, summary, card, grid, metric-group, stepper, callout, badge, table-container, feature-list, code-box). La model card indica que la version v2 reduce la presencia de etiquetas HTML en la cadena de pensamiento respecto a v1, manteniendo la traza de razonamiento en texto plano. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto a HTML: produce un arbol DOM con un unico elemento raiz (`div.ai-view`) y clases CSS predefinidas para resumenes, tarjetas, grids, metricas, steppers, callouts, badges, tablas, listas de caracteristicas y bloques de codigo.
- Generacion de imagen a HTML: acepta imagenes como entrada (mediante el proyector de vision mmproj) y genera una interfaz HTML que describe o responde sobre la imagen.
- Razonamiento con cadena de pensamiento (CoT): emite una traza `<think>` en texto plano, sin etiquetas HTML, antes de la respuesta final.
- Zero-system-prompt: no necesita un prompt de sistema que defina el formato de salida; el contrato esta internalizado.
- Soporte multilingue limitado a ingles y chino.
- Capacidades de razonamiento general y matematicas heredadas del modelo base Qwen3.5-9B (la model card incluye un ejemplo de resolucion paso a paso de una ecuacion lineal).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el CoT sugiere planificacion, pero no se detalla soporte de agentes.

## Casos de uso

- Asistentes conversacionales con salida visual: el modelo puede generar respuestas como tarjetas, tablas y callouts directamente renderizables en una WebUI, eliminando la necesidad de un post-procesado que convierta texto plano en componentes. Es adecuado por su contrato de salida fijo y su modo zero-system-prompt.
- Generacion de paneles de comparacion: ante una pregunta como "compara microservicios y monolito", produce un grid de dos tarjetas con metricas y tabla comparativa, tal como se muestra en la demo de la model card. Util para herramientas de documentacion tecnica.
- Explicaciones paso a paso con stepper: para problemas matematicos o procedimientos, genera un stepper con pasos numerados y bloques de codigo, lo que facilita la lectura en interfaces educativas.
- Descripcion visual de imagenes en formato estructurado: con el proyector de vision, puede responder "que es esto" sobre una imagen generando una comparacion en tarjetas y tablas, util en aplicaciones de vision-asistida.
- Prototipado rapido de interfaces: el modelo puede generar maquetas HTML con clases predefinidas para validar disenos antes de implementarlos, gracias a su contexto de 262.144 tokens que permite incluir especificaciones extensas.
- Generacion de documentacion tecnica visual: a partir de una descripcion textual, produce paginas con resumen, metricas y tablas, adecuado para blogs o wikis internas que rendericen el contrato ai-view.
- Integracion en pipelines de llama.cpp: al estar en GGUF, puede desplegarse con llama-server y consumirse via API compatible con endpoints, lo que facilita su inclusion en flujos de generacion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 requiere aproximadamente 8,87 GiB para los pesos, mas overhead de contexto; Q4_K_M requiere aproximadamente 5,24 GiB. El proyector de vision anade 0,86 GiB si se usa entrada de imagen.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, una GPU con 12-16 GB de VRAM puede ejecutar Q4_K_M con contexto moderado, y una con 24 GB (RTX 3090/4090) o superior puede ejecutar Q8_0 con mayor contexto.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-12 GB para Q4_K_M y 12-16 GB para Q8_0, segun la longitud de contexto.
- Opciones de despliegue: llama.cpp (llama-server, llama serve), con soporte de `-ngl 99` para descarga completa en GPU y `-c 65536` como ejemplo de contexto en la model card. No se mencionan vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| wesjos/Qwen3.5-9B-HTML-v2-GGUF | 8,95 B | 262.144 | Apache 2.0 | GGUF | Generacion de HTML visual (ajuste fino) |
| Qwen/Qwen3.5-9B | 9,65 B (bf16) | 262.144 | no disponible en la informacion | safetensors | Modelo base generalista |
| unsloth/Qwen3.5-9B-GGUF | 9 B | no disponible | no disponible en la informacion | GGUF | Cuantizacion del modelo base sin ajuste |

El modelo se diferencia de Qwen3.5-9B y de su cuantizacion estandar (unsloth) por el ajuste fino orientado a HTML y por el contrato de salida con clases CSS. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Riesgo de alucinacion: como todo modelo generativo, puede producir HTML con clases no definidas en theme.css (la model card menciona `step-list` y `ai-view-header` como clases sin estilo) o contenido factual incorrecto.
- Dependencia de un contrato CSS externo: la salida esta pensada para renderizarse con el theme.css del repositorio Qwen3.5-4B-HTML-v2; sin ese CSS, los componentes no se visualizan correctamente.
- El proyector de vision es obligatorio para entrada de imagen; sin el, el modelo solo procesa texto.
- La model card advierte de que la configuracion de la WebUI del repositorio 4B apunta por defecto al cuantizado de 4B y debe reajustarse al de 9B.
- No se documentan sesgos especificos ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado (su licencia no se detalla en la informacion disponible).
- El contexto nativo es de 262.144 tokens, pero el ejemplo de despliegue usa `-c 65536`; contextos mayores requieren mas VRAM y pueden degradar el rendimiento.
- No hay datos de benchmarks que permitan validar la calidad de la generacion HTML frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wesjos/Qwen3.5-9B-HTML-v2-GGUF
- Modelo base del ajuste: https://huggingface.co/wesjos/Qwen3.5-9B-HTML-v2
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantizacion alternativa (unsloth): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Repositorio con WebUI y theme.css: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2
- Dataset de ajuste fino: https://huggingface.co/datasets/wesjos/mario-html-sft
