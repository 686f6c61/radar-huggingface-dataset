# ulamai/Ulam-2-Small

## Resumen
Ulam-2-Small es un modelo de razonamiento matemático y STEM cuantitativo de 3.085.938.688 parámetros desarrollado por ulam.ai. Se construye sobre la arquitectura Qwen2ForCausalLM (linaje Qwen2.5-3B / Qwen2.5-Coder-3B) y se distribuye en bfloat16 bajo licencia MIT. Su particularidad es el método de construcción: no hay entrenamiento por gradiente, sino una programación en el espacio de pesos que combina dos checkpoints preexistentes mediante sustitución estructurada de componentes, modificación espectral e interpolación dependiente de profundidad.

El checkpoint publicado (W43, identificador interno `W43_S2_simplex_uv_w12`) fusiona `ulamai/Ulam-1-Small` con su ancestro `WeiboAI/VibeThinker-3B`. El resultado modifica el 3,4428 % de las coordenadas BF16 respecto a Ulam-1-Small (106.241.413 de 3.085.938.688), con una norma de Frobenius del delta de 0,423013. El modelo está orientado a resolución exploratoria de problemas matemáticos, razonamiento tipo demostración e derivaciones STEM cuantitativas de varias etapas.

Es relevante ahora porque documenta una vía alternativa al post-entrenamiento clásico: obtener un modelo especializado sin pasos de retropropagación, adaptadores ni optimizador, a partir de checkpoints existentes. El autor publica un informe técnico completo junto con los pesos, lo que permite auditar el procedimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only, 36 bloques, anchura residual 2.048, GQA 16Q/2KV, SwiGLU de anchura 11.008, vocabulario atado de 151.936) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (arquitectónica); evaluado en 65.536–102.400 tokens |
| Tipos de cuantización | no disponible (el checkpoint se publica en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (2 shards independientes, BF16, redondeo round-to-nearest-even) |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only Qwen2 con 36 bloques, anchura residual de 2.048, atención con grouped-query attention de 16 cabezas de query y 2 de key/value, FFN SwiGLU de anchura 11.008 y embeddings atados de 151.936 entradas. El contexto arquitectónico es de 131.072 tokens.

El entrenamiento no usa descenso de gradiente: `0` pasos de retropropagación, adaptadores u optimizador (`torch.set_grad_enabled(False)`). La construcción parte de la cadena Qwen2.5-3B → Qwen2.5-Coder-3B → VibeThinker-3B (V) → Ulam-1-Small (U, v1.0.0). Sobre esa base se genera un intermedio estructurado S = W12 (88.116.709 coordenadas BF16 cambiadas, 2,8554 %, con norma de Frobenius del delta aproximada de 0,676) aplicando: recorte de valores singulares en capas tempranas (σ1..3 → 1,5σ4 en L01–L06), enrutado por segundos momentos de activación en forward sobre triples SwiGLU y pares de cabezas query/output (L04–L27), escalado de key/value compartidas (ρg = 0,55·kg/8 en L04–L24) y ajustes de terminación y bucles tardíos (L27–L35). Finalmente se aplica una mezcla dependiente de profundidad de tres vértices {U, V, S}: en el tronco (L00–L27) la combinación es 0,50·U + 0,15·V + 0,35·S, de modo que las coordenadas no enrutadas reciben un coeficiente donante de 0,15 y las enrutadas incorporan además el término de S. El resultado se convierte a BF16.

## Capacidades
- Generación de texto y razonamiento matemático de tipo demostración, con énfasis en problemas de investigación y derivaciones STEM.
- Razonamiento cuantitativo multi-etapa en dominios STEM verificables.
- Generación de pruebas matemáticas estilo investigación (evaluado en ErdosBench).
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con Text Generation Inference (`text-generation-inference`) y con endpoints compatibles.
- Capacidad multilingüe limitada al inglés.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de pensamiento explícito.

## Casos de uso
- Resolución exploratoria de problemas matemáticos: el modelo genera candidatos de solución y demostraciones que un experto o un verificador formal revisa después; encaja por su orientación a proof-style reasoning y su contexto largo.
- Derivaciones STEM cuantitativas de varias etapas: útil para borradores de cálculos en física, ingeniería o estadística donde se necesita una cadena de pasos que luego se valida manualmente.
- Generación de contraejemplos y conjeturas: el modelo puede proponer contraejemplos o completaciones categóricas que el equipo filtra con verificación independiente, dado que el autor advierte que no es un motor de certificación formal.
- Asistencia a investigación en matemáticas: con 131.072 tokens de contexto arquitectónico puede ingerir enunciados largos, notación y fragmentos de literatura para producir borradores de prueba auditables.
- Prototipado de pipelines de razonamiento verificable: al integrarse con TGI y endpoints compatibles, sirve como generador de candidatos dentro de un bucle generador-verificador con recompensas densas.
- Experimentación en programación del espacio de pesos: al publicar procedencia, NOTICE e informe técnico, el checkpoint sirve como referencia reproducible para estudiar fusiones e intervenciones espectrales sin gradiente.
- Evaluación comparativa de razonamiento STEM: útil como baseline de 3B parámetros en suites con verificación automática y múltiples semillas.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente, `verified: false`):

| Tarea | Conjunto de datos | Métrica | Valor |
|---|---|---|---|
| Razonamiento STEM y matemático con verificación tras selección | Ulam Multi-Domain Verifiable STEM RL Suite (Post-selection Lockbox-592, 2 semillas) | Mean@2 verifier reward | 0,2058 |
| Razonamiento STEM y matemático verificable multidominio | Ulam Multi-Domain Verifiable STEM RL Suite (Dev-Confirm-600, 2 semillas) | Mean@2 verifier reward | 0,2221 |
| Razonamiento STEM y matemático verificable multidominio | Ulam Multi-Domain Verifiable STEM RL Suite (Dev-Confirm-600, 2 semillas) | Full-credit Pass@2 | 0,0300 |
| Generación de pruebas matemáticas de investigación | ErdosBench proof audit A y B (226 problemas, rúbrica 0-4) | Audit A total points (sobre 904) | 129 |
| Generación de pruebas matemáticas de investigación | ErdosBench proof audit A y B (226 problemas, rúbrica 0-4) | Audit B total points (sobre 904) | 120 |

No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 12 GB según longitud de contexto.
- En cuantización de 8 bits, el peso ronda los 3,1 GB; en 4 bits, alrededor de 1,6 GB (estimaciones por tamaño de parámetros; no hay cuantizaciones oficiales publicadas).
- GPU recomendadas para BF16 con contexto largo: A100 40/80 GB, H100, L40S. Para contexto corto y una sola petición, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y tarjetas con 12 GB o más en BF16 con contexto moderado; con 8 GB conviene cuantizar.
- Opciones de despliegue: transformers, Text Generation Inference (soportado de forma explícita), vLLM y llama.cpp/Ollama si se generan GGUF a partir de los safetensors (no se publican GGUF oficiales).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Ulam-2-Small | 3,09 B | 131.072 | MIT | Razonamiento matemático/STEM por programación del espacio de pesos | Hugging Face (safetensors BF16) |
| WeiboAI/VibeThinker-3B (ancestro) | ~3 B | no disponible | no disponible | Razonamiento matemático | Hugging Face |
| ulamai/Ulam-1-Small (ancestro) | ~3 B | no disponible | no disponible | Razonamiento matemático orientado a pruebas | Hugging Face |
| Qwen2.5-3B (linaje) | ~3 B | 32.768 (típico de la familia) | no disponible en esta ficha | Modelo generalista | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- El propio autor indica que no es un motor de certificación formal: las pruebas candidatas, contraejemplos y afirmaciones de completación categórica requieren verificación experta o formal independiente.
- Los benchmarks declarados están marcados como no verificados (`verified: false`) y proceden de suites propias del autor (Ulam AI Verifiable STEM RL Suite, ErdosBench), lo que limita la comparabilidad con evaluaciones estándar.
- El Pass@2 de crédito completo es muy bajo (0,03), lo que sugiere una tasa reducida de soluciones plenamente correctas en la suite de confirmación.
- Idiomas: solo inglés; no hay soporte multilingüe documentado.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: relevante en contextos de demostración matemática, donde el modelo puede producir pasos plausibles pero incorrectos.
- Licencia MIT: permite uso comercial, pero conviene revisar el archivo NOTICE y `provenance.json` por las obligaciones derivadas del linaje Qwen y VibeThinker.
- Al no haber entrenamiento por gradiente, el modelo hereda las capacidades y los defectos de sus checkpoints de origen; no se documentan evaluaciones de seguridad ni de alineación.
- No se publican cuantizaciones oficiales ni GGUF, lo que añade trabajo si se quiere desplegar en hardware limitado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ulamai/Ulam-2-Small
- Modelo base Ulam-1-Small: https://huggingface.co/ulamai/Ulam-1-Small
- Modelo base VibeThinker-3B: https://huggingface.co/WeiboAI/VibeThinker-3B
- Sitio del desarrollador: https://ulam.ai/
- ErdosBench: https://ulam.ai/erdosbench
- Informe técnico (incluido en el repositorio): `paper/ulam2_small_technical_report.pdf`, `.md` y `.tex`
- Procedencia y avisos (incluidos en el repositorio): `NOTICE`, `provenance.json`, `LICENSE`
