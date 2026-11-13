# sshchoholiev/Kev-4B-Adapter-GGUF

## Resumen

Kev-4B-Adapter-GGUF es un adaptador LoRA en formato GGUF publicado por el usuario sshchoholiev, derivado del modelo Kev 1.0 de Jared Palmer (jaredpalmer/kev-4b) y pensado para aplicarse sobre la base Qwen/Qwen3.5-4B-Base. No se trata de un modelo completo, sino de un conjunto de ficheros auxiliares que permiten que una única instancia del modelo base funcione en dos modos: con el LoRA activado para reproducir las "decisiones" de Kev y con el LoRA desactivado para generar texto libre. Según la model card, se utiliza en la aplicación iOS Turtle Soup.

El repositorio incluye dos artefactos: `kev-lora-f16.gguf`, el adaptador LoRA convertido a GGUF en precisión f16 para llama.cpp, y `kev-head.bin`, la cabeza de puntero de Kev en pesos crudos que se aplica sobre los estados ocultos del modelo base. El adaptador está pensado para aplicarse sobre la cuantización Q4_K_M de Qwen3.5-4B-Base publicada por mradermacher.

La relevancia de esta ficha es acotada: se trata de un artefacto de integración con llama.cpp para un caso de uso muy específico (una app iOS), con cero descargas y cero likes en el momento de la consulta. La información técnica disponible es escasa y procede casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-4B-Base (arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | 32.464.896 (adaptador; el modelo base Qwen3.5-4B-Base no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LoRA en f16 (GGUF); el base recomendado es Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LoRA) y binario crudo (`kev-head.bin`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo entrenado desde cero. Se aplica sobre Qwen3.5-4B-Base, un transformer del que la información disponible no detalla capas, atención ni composición del dataset de preentrenamiento. La model card menciona que Qwen3.5 incorpora un mecanismo denominado DeltaNet con reordenación de value-heads, lo que obliga a un tratamiento especial del adaptador.

El detalle técnico más relevante es el proceso de conversión: el conversor de LoRA de llama.cpp no puede aplicar el reordenamiento de value-heads de DeltaNet a los tensores del adaptador, por lo que el autor aplicó dicho reordenamiento primero sobre el adaptador PEFT y después lo convirtió a GGUF. Según la model card, el resultado coincide con el modelo fusionado ggml-org/Kev-4B-GGUF dentro del margen de ruido en TurtleBench. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto libre cuando el LoRA está desactivado, usando el modelo base Qwen3.5-4B-Base.
- Reproducción del comportamiento de decisión de Kev 1.0 cuando el LoRA está activado, mediante la cabeza de puntero `kev-head.bin` aplicada sobre los estados ocultos.
- Conmutación entre ambos modos sobre una única instancia del modelo base, lo que evita cargar dos modelos en memoria.
- Integración con llama.cpp para inferencia local.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Aplicaciones móviles con inferencia local: el diseño de dos modos sobre un solo base permite que una app iOS (Turtle Soup) alterne entre generación libre y lógica de decisión sin duplicar el modelo en memoria, algo crítico en dispositivos con RAM limitada.
- Prototipado de lógica de decisión con LLM: el LoRA y la cabeza de puntero permiten experimentar con un clasificador o selector de acciones basado en un modelo de 4B, aplicando el adaptador sobre Qwen3.5-4B-Base en Q4_K_M.
- Investigación sobre adaptadores en llama.cpp: sirve como ejemplo práctico de conversión de LoRA PEFT a GGUF cuando el modelo base usa mecanismos no estándar como DeltaNet, útil para quien necesite replicar el flujo.
- Despliegue en CPU o hardware modesto: al apoyarse en la cuantización Q4_K_M del base, el conjunto es viable en entornos sin GPU dedicada mediante llama.cpp.
- Evaluación comparativa de adaptadores: permite contrastar el comportamiento con LoRA activado frente a desactivado sobre el mismo base, aislando el efecto del adaptador.
- Integración en pipelines de generación de texto con control de modo: aplicaciones que necesiten alternar entre respuestas libres y respuestas guiadas por una política aprendida, siempre que se acepte la dependencia de llama.cpp.

## Benchmarks y rendimiento

La model card menciona TurtleBench como referencia de validación, indicando que el adaptador coincide con ggml-org/Kev-4B-GGUF dentro del margen de ruido. No se publican puntuaciones numéricas ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa muy poco: el repo completo es de 0,1 GB, y el LoRA en f16 es un fichero pequeño.
- El requisito real viene del modelo base Qwen3.5-4B-Base, que no se incluye en este repositorio y debe descargarse por separado (por ejemplo, la cuantización Q4_K_M de mradermacher).
- VRAM estimada para el base en Q4_K_M: no disponible en la información proporcionada; depende del tamaño efectivo y la longitud de contexto configurada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; el uso previsto con llama.cpp y la mención a una app iOS sugieren despliegue en CPU o hardware de gama media, pero no se aportan cifras.
- Opciones de despliegue: llama.cpp (soporte explícito de LoRA GGUF); otras herramientas no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| sshchoholiev/Kev-4B-Adapter-GGUF | Adaptador LoRA GGUF | 32,5 M (adaptador) | no disponible | Apache-2.0 | Requiere Qwen3.5-4B-Base; conversión con reordenamiento DeltaNet |
| ggml-org/Kev-4B-GGUF | Modelo fusionado GGUF | no disponible | no disponible | Apache-2.0 (según Kev) | Referencia de validación en TurtleBench; no requiere aplicar LoRA por separado |
| jaredpalmer/kev-4b | Modelo original de Kev 1.0 | no disponible | no disponible | Apache-2.0 | Origen del adaptador |
| Qwen/Qwen3.5-4B-Base | Modelo base | ~4B (según nombre) | no disponible | Apache-2.0 | Sin el comportamiento de Kev; usado para texto libre con LoRA desactivado |

## Limitaciones y advertencias

- No es un modelo autónomo: sin Qwen3.5-4B-Base no funciona; el repositorio solo contiene el adaptador y la cabeza.
- La información técnica es muy escasa: no hay datos de contexto, idiomas, dataset de entrenamiento ni benchmarks numéricos.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- El proceso de conversión depende de un reordenamiento manual de tensores DeltaNet; errores en ese paso pueden degradar el comportamiento sin ser evidentes.
- La validación se limita a TurtleBench y a una comparación "dentro del ruido" con el modelo fusionado, sin métricas publicadas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero heredados del modelo base y del entrenamiento de Kev.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B-Base y de Kev 1.0 por separado.
- Caso de uso muy específico (app Turtle Soup); no hay evidencia de robustez en dominios generales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sshchoholiev/Kev-4B-Adapter-GGUF
- Modelo original Kev 1.0: https://huggingface.co/jaredpalmer/kev-4b
- Modelo fusionado de referencia: https://huggingface.co/ggml-org/Kev-4B-GGUF
- Cuantizaciones del base: https://huggingface.co/mradermacher/Qwen3.5-4B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
