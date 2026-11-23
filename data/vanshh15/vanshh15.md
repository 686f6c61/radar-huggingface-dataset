# vanshh15/vanshh15

## Resumen

El identificador `vanshh15/vanshh15` de Hugging Face no corresponde a un modelo de lenguaje entrenado, sino a una model card utilizada como pagina de presentacion profesional por Vansh Agarwal, ingeniero de sistemas de IA y arquitectura de recuperacion. El repositorio se creo el 23 de noviembre de 2026, cuenta con cero descargas y cero likes, y su contenido es un curriculo tecnico con descripcion de proyectos, no pesos ni artefactos de inferencia.

La model card describe cinco proyectos de ingenieria: Veristead (servidor MCP para ejecucion agentica verificada sobre Amazon Alexa+ y AWS), SpatialMind AI (RAG espacial conversacional sobre 3D Gaussian Splatting), Call-using-Agents (analitica de conversaciones de call center con sentence-transformers y K-Means), StrandOps-SRE (agente autonomo de incidentes cloud con Strands Agents SDK) y NovaMart KPI Engine (conversion de lenguaje natural a SQL y dashboards). Ninguno de estos proyectos se distribuye como modelo en este repositorio.

No existe informacion sobre arquitectura de red neuronal, numero de parametros, longitud de contexto, tokenizador, dataset de entrenamiento ni proceso de alineacion. Cualquier uso previsto como modelo de inferencia es inviable con el contenido publicado: el repositorio no contiene ficheros de pesos en ningun formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no publica pesos) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red, tipo de transformer, mecanismos de atencion, capas MoE o cualquier otra decision de diseno. La model card no menciona datos de entrenamiento, numero de tokens, composicion del corpus, tecnicas de RLHF, DPO o decodificacion especulativa.

El contenido del repositorio es una pagina de perfil profesional. Los proyectos descritos emplean modelos de terceros (Claude 3 Haiku via Amazon Bedrock, Llama 3, GPT-4o) y librerias como PyTorch, `transformers`, `sentence-transformers`, LangChain y Strands Agents SDK, pero el autor no publica ningun modelo propio entrenado en este identificador.

## Capacidades

- No se describe ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision asociada a este repositorio.
- No se documenta soporte de tool calling ni function calling a nivel de modelo.
- No se documenta soporte de agentes ni razonamiento multi-paso a nivel de modelo.
- No se documentan capacidades multilingues.
- La model card enumera capacidades de los proyectos del autor (ejecucion agentica verificada con MCP, RAG espacial, clustering de intenciones en conversaciones, agentes SRE), pero estas pertenecen a aplicaciones construidas sobre modelos de terceros, no a un modelo publicado en este repositorio.

## Casos de uso

- Consulta de portafolio profesional: el repositorio sirve como tarjeta de presentacion tecnica de Vansh Agarwal, con enlaces a GitHub, LinkedIn y correo de contacto, util para reclutadores o colaboradores que evalúen su trayectoria.
- Referencia de arquitectura para ejecucion agentica verificada: el proyecto Veristead documenta un bucle `Dispatch → Re-Read → Verify` con recibos SHA-256 en CloudWatch, reutilizable como patron de diseno en sistemas de domotica o automatizacion industrial.
- Referencia de RAG espacial: SpatialMind AI describe un pipeline de retrieval vectorial (ChromaDB) combinado con grafo de escena (Neo4j) y resaltado en memoria sobre 3D Gaussian Splatting, aplicable a visores de gemelos digitales.
- Referencia de analitica de conversaciones: Call-using-Agents documenta normalizacion de transcripciones, embeddings con `sentence-transformers`, clustering K-Means y generacion de prompts few-shot, replicable en equipos de calidad de call center.
- Referencia de agentes SRE: StrandOps-SRE describe un ciclo cerrado de deteccion, diagnostico, remediacion y postmortem con herramientas tipadas acotadas, util como plantilla de automatizacion de incidentes.
- Referencia de NL a SQL: NovaMart KPI Engine documenta la conversion de preguntas de negocio en SQL y dashboards, patron aplicable a equipos de business intelligence.

En ningun caso estos usos implican ejecutar el repositorio como modelo: son referencias documentales de los proyectos descritos en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye metricas de los proyectos del autor (por ejemplo, 191 tests unitarios en 13 suites para Veristead, 60 FPS con 4,8 millones de splats en SpatialMind AI, 32 bytes por splat en memoria), pero ninguna corresponde al rendimiento de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos publicados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

Los proyectos descritos en la model card emplean servicios gestionados (Amazon Bedrock con Claude 3 Haiku) o modelos de terceros (Llama 3, GPT-4o) y no requieren el despliegue de este repositorio.

## Comparativa con modelos similares

No disponible. El repositorio no contiene un modelo de lenguaje y no existe una categoria de modelos comparables; los unicos elementos comparables serian paginas de perfil de otros ingenieros en Hugging Face, lo que queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador, configuracion ni codigo de inferencia; no puede utilizarse como modelo.
- La licencia MIT declarada aplica al contenido del repositorio, no a un artefacto de modelo inexistente.
- Las afirmaciones de la model card (porcentajes de fallo en rutinas de domotica, metricas de rendimiento, numero de tests) proceden del autor y no han sido verificadas de forma independiente en la informacion disponible.
- El identificador y el contenido pueden confundir a herramientas de descubrimiento de modelos que indexen Hugging Face por nombre o etiquetas.
- No se debe citar este repositorio como fuente de un modelo en publicaciones tecnicas ni incluirlo en pipelines de evaluacion.
- Riesgo de alucinacion y sesgos: no aplicable, al no existir modelo desplegable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vanshh15/vanshh15
- Perfil de GitHub del autor: https://github.com/Vapa1510
- Perfil de LinkedIn del autor: https://www.linkedin.com/in/vansh-agarwal-6a9901262
- Space de Veristead: https://huggingface.co/spaces/vanshh15/veristead-agent-verification
- Codigo de Veristead: https://github.com/Vapa1510/amazon_veristead_mcp
- Codigo de SpatialMind AI: https://github.com/Vapa1510/SpatialMind-AI
- Codigo de Call-using-Agents: https://github.com/Vapa1510/Call-using-Agents
- Codigo de StrandOps-SRE: https://github.com/Vapa1510/strandops-sre
- Codigo de NovaMart KPI Engine: https://github.com/Vapa1510/accenture_businessintelli
