# wesjos/Spark-x2.6-4B-HTML

## Resumen

Spark-x2.6-4B-HTML es un ajuste fino (SFT) del modelo base XHToken/Spark-X2.6-4B, publicado por el usuario wesjos, cuyo objetivo es que el modelo responda con HTML renderizable en lugar de prosa: tarjetas, tablas, bloques de metricas y avisos visuales. El modelo base pertenece a la serie Spark-X2.6 de XHToken, una familia orientada a despliegue en dispositivo ("on-device AI") que mantiene la arquitectura de Spark-X2.5 y mejora sus capacidades mediante post-entrenamiento en codigo, agentes, contexto largo, multilingue y razonamiento.

Tecnicamente es un transformer decoder-only de 4.112.079.360 parametros (bf16, 7,66 GiB en un unico shard) con 36 capas, de las cuales 9 son de atencion completa y 27 de atencion deslizante con ventana de 512 tokens. Declara una longitud de contexto nativa de 1.048.576 tokens (`max_position_embeddings`), aunque el tokenizador anuncia 131.072. Emplea GQA con 16 cabezas de atencion y 4 de KV, head_dim de 256 y RoPE parcial (0,25) en las capas de atencion completa.

Su relevancia practica es concreta: convierte la salida del modelo en interfaces visuales directamente renderizables, lo que permite construir paneles, explicaciones y respuestas estructuradas sin post-procesado. Incluye un WebUI propio con panel de chain-of-thought, vista de codigo fuente y cinco temas predefinidos. La licencia es Apache-2.0 y el modelo solo declara soporte para ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only `Spark2_5ForCausalLM`; 36 capas (9 de atencion completa + 27 de atencion deslizante con ventana 512) |
| Parametros totales | 4.112.079.360 (335,5 M en embeddings, 3,78 B no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 nativo (`max_position_embeddings`); el tokenizador anuncia 131.072 |
| Tipos de cuantizacion | bf16 en este repo; GGUF `Q4_K_M` (2,42 GiB) y `Q8_0` (4,07 GiB) en el repo hermano |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, un shard, 7,66 GiB); GGUF en repo separado |

Otros datos tecnicos: atencion con 16 cabezas de consulta y 4 de clave/valor, head_dim 256, RoPE parcial 0,25 en capas de atencion completa, vocabulario de 131.072 tokens. Prompt de sistema por defecto: `You are Mario-html. You are a helpful assistant who generates nice visual content.`

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Spark-X2.6-4B, que segun el repositorio oficial de XHToken mantiene exactamente la misma estructura que Spark-X2.5 y obtiene sus mejoras mediante post-entrenamiento, no mediante cambios estructurales. El diseno combina capas de atencion completa (9) con capas de atencion deslizante de ventana 512 (27), un esquema de atencion hibrida que reduce el coste de memoria y computo en contextos largos manteniendo un subconjunto de capas con visibilidad global. El uso de GQA (16/4) y RoPE parcial sobre las capas completas apunta en la misma direccion de eficiencia.

Sobre el ajuste fino de wesjos no se detalla en la informacion disponible la composicion del dataset, el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; la model card unicamente etiqueta el proceso como `sft`. El resultado es un modelo que ha aprendido un contrato de salida basado en clases CSS y componentes HTML (tarjetas, tablas, tiles de metricas, callouts), verificado contra el `theme.css` del WebUI incluido. El modelo soporta un modo de razonamiento (`enable_thinking`, `reasoning_effort`) cuyo stream `<think>` se expone en la interfaz.

## Capacidades

- Generacion de HTML renderizable como formato de respuesta principal: tarjetas de definicion, tablas, bloques de metricas y avisos visuales.
- Razonamiento con modo thinking activable (`enable_thinking=True`) y control de esfuerzo (`reasoning_effort`).
- Generacion de codigo y explicaciones tecnicas (el modelo base declara mejoras en codigo y agentes).
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base Spark-X2.6.
- Manejo de contexto largo gracias a la ventana nativa de 1.048.576 tokens.
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Integracion con backend compatible con OpenAI a traves del WebUI incluido.
- Salida con panel de chain-of-thought colapsable, vista de codigo fuente y boton de copia de HTML por mensaje.

## Casos de uso

- Documentacion tecnica visual: el modelo genera paginas HTML con tarjetas de definicion y tablas comparativas (por ejemplo, explicar ReLU con una curva y una tabla de dominio, salida y pendiente), lo que permite publicar documentacion estructurada sin escribir el marcado a mano.
- Asistentes de estudio y onboarding: para consultas como "como aprender C++", produce planes de estudio con avisos, listas de caracteristicas y tarjetas de librerias con chips de codigo en linea, adecuado para portales de formacion internos.
- Paneles de metricas y reporting: sus tiles de metricas y tablas permiten generar vistas de KPI directamente renderizables en un navegador, utiles en herramientas internas de monitorizacion.
- Prototipado rapido de UI: con 1 M de tokens de contexto puede recibir especificaciones extensas o varios documentos de diseno y devolver una propuesta de interfaz en HTML coherente con el contrato de clases del tema elegido.
- Generacion de respuestas enriquecidas en chatbots: integrado como backend compatible con OpenAI, sustituye respuestas en prosa por componentes visuales, mejorando la legibilidad en soporte tecnico y explicaciones de producto.
- Analisis de documentos largos con salida estructurada: gracias a la ventana de contexto nativa, puede procesar contratos o informes extensos y emitir resumenes en tablas y tarjetas en lugar de texto corrido.
- Despliegue en dispositivo: con la variante GGUF `Q4_K_M` (2,42 GiB) puede ejecutarse en hardware de consumo mediante llama.cpp, habilitando asistentes locales que generan interfaces sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento medidos que aparecen en la model card son de la demo del WebUI: la consulta sobre ReLU genero 3882 tokens en 30,09 s, a 129 tok/s, con el modelo en el host de entrenamiento. No se especifica el hardware empleado.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 8,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 10-12 GB para inferencia comoda.
- Cuantizacion `Q8_0`: 4,07 GiB de pesos; `Q4_K_M`: 2,42 GiB.
- GPU recomendadas: A100 o H100 para bf16 con contexto muy largo; RTX 4090 (24 GB) para bf16 con margen amplio; RTX 3090/4080 (16-24 GB) para bf16 o Q8_0.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con `Q4_K_M`, y en 12 GB o mas con `Q8_0`.
- Opciones de despliegue: transformers (requiere `transformers>=5.0.0` por el `tokenizer_class: TokenizersBackend`), llama.cpp (soporte nativo `spark2_5` desde la build b10828 y en v0.9.0), backend compatible con OpenAI para el WebUI incluido.
- Throughput: 129 tok/s medidos en la demo del autor, sin especificar hardware; la latencia real dependera del backend y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-x2.6-4B-HTML | 4,11 B | 1.048.576 nativo | Salida HTML renderizable (SFT sobre Spark-X2.6-4B) | Apache-2.0 | Hugging Face (bf16 y GGUF) |
| XHToken/Spark-X2.6-4B | 4,11 B | 1.048.576 nativo (heredado) | Modelo base generalista on-device | Apache-2.0 | Hugging Face |
| Alternativas de ~4 B con salida estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este ajuste con alternativas de la misma categoria; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Idiomas: solo declara ingles y chino; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Riesgo de alucinacion: como todo modelo generativo de 4 B, puede inventar datos en tablas y metricas; al presentarse en formato visual estructurado, el error puede parecer mas creible.
- Contrato de salida fragil: las clases CSS estan verificadas contra el `theme.css` del WebUI incluido; fuera de ese contrato, el HTML puede renderizarse sin estilo.
- Configuracion del WebUI: `webui/config.json` incluye una ruta de modelo del host de entrenamiento (`/mnt/sdb/models/...`) que no existe en otras maquinas; hay que apuntarla al cuantizador propio o usar `backend_mode: "direct"`.
- Dependencia de version: el tokenizador exige `transformers>=5.0.0`; con 4.57.1 falla con `ValueError: Tokenizer class TokenizersBackend does not exist`.
- Requiere `trust_remote_code=True` y `custom_code`, lo que implica ejecutar codigo del repositorio.
- Adopcion muy baja: 47 descargas y 0 likes en el momento de la consulta, sin validacion independiente de calidad.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y este ajuste no ofrecen garantias ni auditoria de sesgos; no se documentan sesgos conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Spark-x2.6-4B-HTML
- Variante GGUF: https://huggingface.co/wesjos/Spark-x2.6-4B-HTML-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio GitHub de la serie Spark-X2.6: https://github.com/XHToken/Spark-X2.6
- README de la rama X2.6: https://github.com/XHToken/Spark-X2.6/blob/X2.6/README.md
- Soporte nativo `spark2_5` en llama.cpp (build b10828): https://github.com/ggml-org/llama.cpp
