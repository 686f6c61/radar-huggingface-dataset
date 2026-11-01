# White-Wolf13/Qwen3.6-35B-A3B-GOLD-APEX-GGUF

## Resumen

Qwen3.6-35B-A3B-GOLD-APEX-GGUF es una cuantización GGUF del modelo Qwen3.6-35B-A3B, un transformer de arquitectura Mixture-of-Experts (MoE) dispersa con 34.660.610.688 parámetros totales y 256 expertos, publicado por el usuario White-Wolf13 en HuggingFace. El modelo base lo desarrolla el equipo Qwen (Alibaba), mientras que esta versión GOLD es una reconstrucción de pesos del autor mediante un proceso propietario de alineamiento de variedad latente y calibración espectral, seguido de una segunda etapa de fusión en el espacio de pesos que el autor mantiene confidencial.

El interés principal de esta ficha reside en su pipeline de cuantización Enhanced APEX-I, que aborda un problema concreto de los MoE dispersos: la degradación del enrutamiento de expertos cuando se cuantizan las puertas del router. El autor preserva `ffn_gate_inp` en FP32 y los tensores del experto compartido (`ffn_down_shexp`) en FP16, y calibra la matriz de importancia sobre un proxy dedicado con suelo de Q6_K en lugar de sobre el artefacto cuantizado. Se ofrecen cinco perfiles con tamaños entre 11,29 GiB y 26,73 GiB, lo que permite desplegarlo desde GPUs de 12 GB hasta configuraciones de doble GPU.

La relevancia actual es doble: por un lado, demuestra técnicas de cuantización conscientes de la arquitectura MoE que otros cuantizadores genéricos no aplican; por otro, mantiene la cadena de razonamiento nativa `<think>` del modelo base, lo que lo hace utilizable en tareas de razonamiento multi-paso, uso de herramientas y roleplay. El modelo declara soporte para inglés, chino y polaco, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) dispersa, 256 expertos, GQA con `head_count_kv = 2` |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 16384`; se mencionan ventanas de 32k–64k+) |
| Tipos de cuantizacion | GGUF APEX-I en cinco perfiles: PRO (~6,62 BPW), QUALITY (~5,77 BPW), BALANCED (~5,19 BPW), COMPACT (~3,89 BPW), MINI (~2,80 BPW) |
| Idiomas soportados | en, zh, pl |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE disperso con 256 expertos y atención GQA con solo 2 cabezas KV, lo que mantiene el KV cache muy compacto y facilita el despliegue con contexto largo en hardware modesto. El autor no documenta el número de parámetros activos por token ni la composición del dataset de entrenamiento original de Qwen3.6-35B-A3B.

La construcción de la variante GOLD no emplea fine-tuning por descenso de gradiente, sino un protocolo propietario de alineamiento de variedad latente y calibración espectral del espacio de pesos, seguido de una segunda etapa de fusión no revelada. Según el autor, este enfoque evita el olvido catastrófico y la degradación estilística típicos del fine-tuning estándar. La cuantización Enhanced APEX-I introduce cuatro decisiones técnicas verificables en la model card: bloqueo de las puertas del router `ffn_gate_inp` en FP32 para evitar deriva de enrutamiento; estabilización de `ffn_down_shexp` en FP16 para colapsar los picos de divergencia KL; asignación asimétrica de bits (Q8_0 en down-projections sensibles, Q6_K/Q4_K en gate/up); y calibración iMatrix sobre 168 fragmentos de 16.384 tokens (más de 2,75 millones de tokens) de un corpus que cubre tool-calling, lógica multi-turno, síntesis de código y diálogo enciclopédico.

## Capacidades

- Generación de texto conversacional multi-turno con cadena de razonamiento nativa estructurada en `<think>`.
- Razonamiento multi-paso profundo: análisis previo del prompt antes de emitir la respuesta final.
- Síntesis y análisis de código en dominios de programación complejos, según declara el autor.
- Uso de herramientas y function calling, reflejado tanto en los tags (`tool-use`) como en el corpus de calibración.
- Roleplay y escritura creativa, con un estilo descrito como directo y sin hedging innecesario.
- Capacidades multilingües en inglés, chino y polaco, con especial énfasis declarado en inglés y polaco.
- Compatibilidad con endpoints (`endpoints_compatible`) para servir el modelo mediante API.
- No se declaran capacidades de visión, audio ni modalidades adicionales.

## Casos de uso

- Asistente de razonamiento técnico: el modo `<think>` permite al modelo descomponer problemas de análisis o investigación en pasos intermedios antes de responder, útil en herramientas internas de soporte a ingeniería donde se requiere trazabilidad del razonamiento.
- Generación de código en pipelines de desarrollo: el soporte de tool calling y la calibración sobre corpus de síntesis de código lo hacen adecuado para integrarse en asistentes de IDE o revisores automáticos de parches, con el perfil BALANCED como punto de partida en una RTX 4090.
- Agente multi-paso con llamadas a funciones: la preservación del router en FP32 mantiene estable la selección de expertos durante sesiones largas de agente, lo que reduce la variabilidad de comportamiento entre turnos.
- Atención al cliente multilingüe en inglés y polaco: el modelo cubre conversaciones multi-turno en ambos idiomas y puede desplegarse con el perfil COMPACT (15,69 GiB) en GPUs de 16 GB como la T4 o la V100, manteniendo latencia baja.
- Roleplay y narrativa interactiva: el ajuste declarado hacia la fidelidad de intención y el estilo directo encajan en aplicaciones de ficción interactiva o simulación de personajes, donde el contexto largo y el KV cache compacto permiten sesiones extensas.
- Despliegue en hardware de consumo: el perfil MINI (11,29 GiB) permite aceleración completa por GPU en tarjetas de 12 GB como la RTX 3060 o la RTX 4070, habilitando prototipos locales de un MoE de 35B sin infraestructura de servidor.
- Investigación sobre cuantización MoE: los perfiles APEX-I sirven como material de estudio para comparar el impacto de preservar routers en FP32 frente a cuantizarlos, dado que el autor documenta explícitamente las decisiones de asignación de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según perfil: MINI 11,29 GiB; COMPACT 15,69 GiB; BALANCED 20,95 GiB; QUALITY 23,29 GiB; PRO 26,73 GiB.
- Perfil MINI: cabe completo en GPUs de 12 GB (RTX 3060, RTX 4070) con aceleración total por GPU.
- Perfil COMPACT: cabe en GPUs de 16 GB (RTX 4080, Tesla T4, V100 16GB) con ejecución muy rápida según el autor.
- Perfil BALANCED: ajuste óptimo en 24 GB (RTX 3090, RTX 4090), dejando 3–4 GiB de margen para contextos de 32k–64k.
- Perfil QUALITY: cabe nativamente en 24 GB con contexto estándar; mejor relación calidad/VRAM según el autor.
- Perfil PRO: requiere doble GPU (2×16 GB) o configuración híbrida de 32 GB de RAM más 12 GB de VRAM; precisión casi sin pérdidas.
- Despliegue mediante llama.cpp y llama-server; el ejemplo de la model card usa `llama-cli` con `-ngl 14`, `-c 16384` y `-fa on` para el perfil BALANCED en configuración híbrida CPU/GPU.
- Se recomienda Flash Attention (`-fa on`) por la arquitectura GQA con `head_count_kv = 2`, que mantiene el KV cache compacto.
- Parámetros de muestreo sugeridos: `--temp 0.6`, `--top-k 20`, `--top-p 0.95`.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-GOLD-APEX-GGUF | 34,66B (MoE, 256 expertos) | no disponible | Apache 2.0 | GGUF (5 perfiles APEX-I) | HuggingFace, 961 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 34,66B (MoE, 256 expertos) | no disponible | Apache 2.0 | safetensors y cuantizaciones estándar | HuggingFace |
| Otras cuantizaciones GGUF del mismo base | 34,66B | no disponible | Apache 2.0 | GGUF genérico | HuggingFace |

La comparación relevante es frente al checkpoint base y frente a cuantizaciones GGUF estándar del mismo modelo: la diferencia declarada por el autor está en la preservación del router en FP32, la estabilización del experto compartido en FP16 y la calibración sobre un proxy con suelo Q6_K, factores que según la model card reducen la deriva de enrutamiento y los picos de divergencia KL. No se dispone de datos de benchmarks que permitan cuantificar esa mejora frente a otras alternativas.

## Limitaciones y advertencias

- El proceso de construcción GOLD incluye una segunda etapa de fusión de pesos que el autor declara confidencial; no es posible auditar ni reproducir el pipeline completo.
- No se han publicado benchmarks que respalden las afirmaciones de mejora en razonamiento o fidelidad de intención frente al modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cadena `<think>` no garantiza corrección factual.
- Cobertura lingüística limitada a inglés, chino y polaco; el rendimiento en castellano no está documentado.
- Los sesgos del modelo base Qwen3.6-35B-A3B se heredan sin que el autor documente mitigaciones específicas.
- El número de parámetros activos por token no está disponible, lo que dificulta estimar coste computacional por inferencia.
- La longitud de contexto máxima no se especifica; los ejemplos de la model card usan 16.384 tokens y mencionan ventanas de 32k–64k+, pero sin cifra oficial.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B antes de un despliegue comercial.
- El repositorio tiene 961 descargas y 0 likes en el momento de la consulta, con una única actualización el mismo día de su creación; se trata de una publicación reciente y con poca validación comunitaria.
- Los perfiles PRO y QUALITY dejan poco margen de VRAM, lo que puede limitar la longitud de contexto efectiva en GPUs de 24 GB.

## Enlaces

- [HuggingFace: White-Wolf13/Qwen3.6-35B-A3B-GOLD-APEX-GGUF](https://huggingface.co/White-Wolf13/Qwen3.6-35B-A3B-GOLD-APEX-GGUF)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
