# Thox-ai/ThoxAir-Route-0.5B

## Resumen

ThoxAir-Route-0.5B es un artefacto de empaquetado publicado por Thox-ai sobre los pesos sin modificar de Qwen/Qwen2.5-0.5B-Instruct. No se trata de un modelo entrenado: el autor declara explícitamente que no ha habido entrenamiento alguno y que los pesos son los del publicador original, descargados por Ollama desde el tag fijado `qwen2.5:0.5b`. Lo que aporta el repositorio es un `Modelfile` de Ollama con un perfil de sistema, un `manifest.json` con el pin de la base y la versión del knowledge pack, y un fichero JSONL con ocho entradas verificadas de documentación propia.

El propósito declarado es servir como configuración de enrutamiento para el objetivo "ThoxAir (2 GB)", es decir, un perfil de despliegue local-first pensado para ejecutarse en hardware modesto con Ollama, de forma autónoma y offline. El modelo base es un transformer decoder-only de 0,5 mil millones de parámetros con 32.768 tokens de contexto nativo, licencia Apache-2.0 y capacidades multilingües, aunque la model card restringe el uso declarado al inglés.

Su relevancia práctica es limitada pero concreta: demuestra un patrón de distribución de "knowledge packs" versionados sobre modelos pequeños para respuestas ancladas a documentación, con reglas de sistema que fuerzan a declarar la ausencia de contexto en lugar de inventar especificaciones. Es un caso de estudio de empaquetado reproducible más que un modelo con capacidades nuevas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parámetros totales | 0,5B (aproximadamente 494M, según el modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; la evaluación publicada se realizó a 8.192 tokens |
| Tipos de cuantización | Q4-clase por defecto en el tag de Ollama (modelo publicado de 0,40 GB); otras cuantizaciones dependen del runtime Ollama |
| Idiomas soportados | Inglés declarado en la model card; el modelo base Qwen2.5 es multilingüe |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Pesos originales de Qwen2.5-0.5B-Instruct gestionados por Ollama; el repositorio contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl` (no contiene safetensors ni GGUF propios) |

## Arquitectura y entrenamiento

No hay entrenamiento. El autor lo declara de forma explícita: los pesos son los de Qwen/Qwen2.5-0.5B-Instruct, fijados en el momento de la compilación al digest `a8b0c51577010a279d933d14c2a8ab4b268079d44c5c8830c0a93900f1827c67` del tag `qwen2.5:0.5b`. La personalización consiste únicamente en el perfil de sistema incluido en el `Modelfile` y en el THOX Knowledge Pack v0.1, un JSONL de 4.652 bytes con ocho entradas públicas verificadas que se emplean para respuestas ancladas por recuperación.

La innovación técnica reseñable no está en el modelo sino en el proceso de empaquetado: el perfil de sistema incorpora una regla explícita de estado en vivo colocada al principio del prompt y una frase de cierre sobre ausencia de telemetría en vivo, añadida tras detectar en una primera compilación que el modelo aceptaba una topología fabricada. Solo se publicó la segunda compilación, la reforzada. El autor también documenta que el kit de dispositivo define ThoxAir-Route-0.5B y ThoxAir-Chat-0.5B con el mismo `Modelfile`, de modo que ambos listados son el mismo artefacto de configuración bajo dos nombres de rol, diferenciados solo en metadatos del manifiesto.

## Capacidades

- Generación de texto conversacional y respuestas cortas, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Respuestas ancladas a un knowledge pack suministrado (8 entradas en la versión 0.1), con instrucción de declarar la falta de contexto en lugar de inventar especificaciones.
- Recomendación de enrutamiento etiquetada como tal (local primero, nube solo con consentimiento explícito), sin afirmar estado en vivo.
- Rechazo de confirmaciones sobre topologías de red fabricadas, según la prueba de trampa documentada por el autor.
- Ejecución local y offline mediante Ollama, sin dependencia de servicios externos.
- Integración opcional con el runtime THOX para descubrimiento MeshStack y ejecución autorizada; los pesos por sí solos no proporcionan acceso a malla ni enrutamiento en vivo.
- No dispone de tool calling, function calling, modo thinking, visión ni audio documentados en la información disponible.

## Casos de uso

- Asistente de configuración offline en dispositivos de 2 GB: el modelo se ejecuta con Ollama en CPU con 0,59 GB de RAM en carga, por lo que cabe en equipos de gama baja sin GPU y responde a consultas sobre el perfil del dispositivo sin conexión.
- Respuestas ancladas a documentación interna: con el knowledge pack v0.1 inyectado como contexto, el modelo responde con los hechos del pack (6 de 8 temas en la evaluación publicada) y se le instruye a admitir cuando no dispone de la información.
- Enrutamiento asistido con consentimiento explícito: el perfil de sistema fuerza a presentar la decisión local-primero como recomendación etiquetada, adecuado para interfaces donde el usuario debe autorizar el envío a la nube.
- Pruebas de robustez frente a alucinación de infraestructura: el rechazo documentado ante topologías fabricadas lo hace útil como caso de validación en pipelines de evaluación de asistentes de red.
- Prototipado de agentes locales de bajo coste: sirve para validar flujos de conversación multi-turno y recuperación de contexto antes de escalar a modelos mayores, con un coste de cómputo mínimo.
- Distribución reproducible de configuraciones: el par `Modelfile` + `manifest.json` con pin de digest permite reconstruir exactamente el entorno en otra máquina mediante `ollama create`, útil para equipos que necesitan artefactos versionados y auditables.
- Docencia y demostración de empaquetado de modelos: ejemplo didáctico de cómo separar pesos upstream, perfil de sistema y knowledge pack en un artefacto de despliegue.

## Benchmarks y rendimiento

El autor publica mediciones de rendimiento, no de calidad en benchmarks estándar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Métrica | Resultado | Condiciones |
|---|---|---|
| Generación de texto largo | 55,35 tokens/s | Benchmark de 1.024 tokens, CPU x86_64, 4 vCPU / 8 GB |
| Respuestas cortas | 22,8–71,7 tokens/s | Conjunto de pruebas smoke |
| Memoria en carga | 0,59 GB RAM, 0 GB VRAM | Ejecución en CPU |
| Preguntas smoke de fábrica | 3/3 coherentes y según perfil | Conjunto de 3 preguntas |
| Anclaje al Knowledge Pack v0.1 | 6/8 temas con hechos del pack | Pasaje suministrado, una pregunta por tema |
| Trampa de topología fabricada | Rechazada | Prueba de confirmación falsa |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada | Sin afirmación de estado en vivo |

Medición realizada el 2026-10-31 sobre host CPU-only x86_64 de clase 4 vCPU / 8 GB, a 8.192 tokens de contexto.

## Requisitos de hardware

- VRAM estimada: 0 GB en ejecución CPU; el modelo publicado ocupa 0,40 GB en disco y 0,59 GB de RAM al cargarse en cuantización Q4-clase.
- GPU recomendadas: no se documentan; el autor valida únicamente ejecución en CPU. Cualquier GPU con al menos 1 GB de VRAM libre puede alojar la cuantización Q4, pero no hay datos de rendimiento en GPU publicados.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 1 GB o más de VRAM libre, aunque la validación oficial es CPU-only.
- Opciones de despliegue: Ollama (método oficial, tanto el modelo publicado `Thox-ai/thoxair-route-0.5b` como compilación local con `ollama create`). No se documentan vLLM, TGI, llama.cpp directo ni otras rutas.
- Latencia y throughput: 55,35 tokens/s en generación larga y 22,8–71,7 tokens/s en respuestas cortas sobre 4 vCPU, según la medición del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento propio | Licencia | Formato de distribución |
|---|---|---|---|---|---|
| ThoxAir-Route-0.5B | 0,5B | 32.768 (base); evaluado a 8.192 | No (empaquetado sobre Qwen2.5-0.5B-Instruct) | Apache-2.0 | Ollama (Modelfile + manifest + knowledge pack) |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Sí (upstream) | Apache-2.0 | Safetensors, GGUF y otros |
| ThoxAir-0.5B (flagship entrenado, citado por el autor) | 0,5B | No disponible | Sí, según el autor | No disponible en la información | No disponible |

La diferencia frente a Qwen2.5-0.5B-Instruct no está en los pesos, que son idénticos, sino en el perfil de sistema y el knowledge pack. Frente al flagship ThoxAir-0.5B, el autor insiste en que este artefacto es distinto y no está cualificado sobre hardware de dispositivo.

## Limitaciones y advertencias

- Modelo de 0,5B: razonamiento y recuerdo materialmente limitados; el autor recomienda tratar sus respuestas en consecuencia.
- Anclaje medido de 6/8 temas en el knowledge pack: dos de cada ocho consultas no obtuvieron los hechos esperados en la evaluación publicada.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como no censurado.
- Sin contexto suministrado, el modelo debe declarar que no dispone de la información; el cumplimiento de esta regla depende del prompt y no está garantizado.
- Las acciones externas requieren autorización del runtime; los pesos por sí solos no proporcionan enrutamiento en vivo ni acceso a malla.
- No está cualificado sobre hardware de dispositivo según el propio autor.
- Ambigüedad de artefacto: ThoxAir-Route-0.5B y ThoxAir-Chat-0.5B comparten `Modelfile` idéntico y solo se diferencian en metadatos del manifiesto, lo que puede confundir en auditorías.
- Idioma declarado: inglés; el uso en castellano no está validado por el autor pese al multilingüismo del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se declaran bajo la misma licencia sin términos adicionales documentados.
- Sin datos de benchmarks estándar de calidad; la única evidencia es el conjunto smoke y las pruebas de anclaje del autor.
- Riesgo de alucinación presente como en cualquier modelo de este tamaño, mitigado solo parcialmente por las reglas del perfil y el pack.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/ThoxAir-Route-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo publicado en Ollama: `Thox-ai/thoxair-route-0.5b`
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos del autor.
