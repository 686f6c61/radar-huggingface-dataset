# tmickleydoyle/tiny-autocomplete

## Resumen

`tiny-autocomplete` (publicado por el autor bajo el nombre de proyecto *ghost-typer*) es un modelo de autocompletado de texto orientado a prompts de asistentes de programación, desarrollado por tmickleydoyle. No es un modelo entrenado con descenso de gradiente ni derivado de pesos preentrenados: es un `LlamaForCausalLM` **compilado** a partir de reglas en forma cerrada (n-gramas) aplicadas sobre aproximadamente 126.000 líneas de texto escrito por humanos procedentes de WildChat-1M, OASST2, MBPP y CoNaLa.

El modelo resuelve un problema muy concreto: sugerir el siguiente fragmento de texto mientras el usuario escribe en un editor o caja de prompt, mostrando ghost text solo cuando la confianza supera un umbral calibrado. Su interés radica en que consigue una precisión del 90,8% en sugerencias mostradas con un consumo de recursos mínimo, lo que lo hace viable para ejecución en el navegador o en CPU sin servidor.

La arquitectura declarada es Llama con 399.916.440 parámetros totales (de los cuales aproximadamente el 97% son ceros según la model card), un vocabulario de 6.000 palabras y 12.607 contextos en la variante para `transformers`. Existe una variante hermana para navegador (`ghost-typer-web`) con vocabulario de 30.893 palabras y formato uint8 de 10,7 MB. La licencia es MIT y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (`LlamaForCausalLM`), compilado a partir de n-gramas (sin entrenamiento) |
| Parametros totales | 399.916.440 (aproximadamente 97% ceros según la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el modelo opera sobre contextos n-grama de hasta 12.607 contextos discretos en la variante `transformers` |
| Tipos de cuantizacion | float32 (canónico en este repo); uint8 en la variante navegador (`ghost-typer-web/model.bin`); float32 sin cuantizar en `model-f32.bin` |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 1,60 GB); `.bin` propietario en la variante navegador (10,7 MB uint8, 16,8 MB float32) |

## Arquitectura y entrenamiento

El modelo es un `LlamaForCausalLM` estándar cuyos pesos se generan mediante reglas en forma cerrada definidas en `build_weights.py`, sin descenso de gradiente ni pesos preentrenados. La fuente de datos son aproximadamente 126.000 líneas de texto humano de WildChat-1M, OASST2, MBPP y CoNaLa. La red resultante es extremadamente dispersa: alrededor del 97% de los 400 millones de parámetros son ceros, lo que permite almacenar únicamente las partes no nulas en la variante compilada para navegador.

Una innovación técnica destacable es el escalado de logits por 1e-5 para mantener la red exacta, lo que impide generar versiones en float16 o bf16 (el autor indica explícitamente que media precisión rompería el modelo). La variante navegador no es una cuantización de `model.safetensors`, sino una compilación hermana con vocabulario mayor (30.893 frente a 6.000 palabras) porque en su formato disperso las palabras tienen coste casi nulo. La cuantización uint8 frente a float32 en la variante navegador cuesta 0,14 puntos de keystrokes saved (23,00% frente a 23,14%) con precisión prácticamente idéntica (90,8% frente a 90,7%).

## Capacidades

- Autocompletado de ghost text para prompts de asistentes de programación, con umbral de confianza configurable en tiempo de ejecución.
- Generación de texto de siguiente token mediante `transformers` (`pipeline("text-generation")`), sin `trust_remote_code`.
- Sugerencia palabra a palabra mientras cada siguiente palabra tenga probabilidad ≥ 0,8 (`ext = 0.8`).
- Control de precisión frente a cobertura mediante el umbral τ de primera palabra (0,62 por defecto, hasta 0,95).
- Ejecución en navegador mediante TypeScript sin dependencias (`web/autocomplete.ts`, `tokenizer.ts`), en hilo principal, Web Worker, Bun o Node.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Autocompletado en editores de código y cajas de prompt: el modelo sugiere continuaciones como `ction to` tras `write a python fun` con 94% de confianza, integrándose en un editor mediante Tab para aceptar la sugerencia.
- Asistentes de programación en el navegador: la variante `ghost-typer-web` (10,7 MB uint8) se carga desde Hugging Face y ejecuta en la pestaña del usuario con latencia mediana de 2,5 ms por pulsación (p95 de 4,3 ms), sin servidor ni backend.
- Herramientas de desarrollo en local sin GPU: la variante `transformers` corre en CPU PyTorch a 65 ms por siguiente token, adecuada para scripts de investigación o pipelines por lotes.
- Reducción de escritura en formularios o interfaces de chat: con el umbral por defecto se ahorra un 23,0% de pulsaciones aceptando cada sugerencia correcta con Tab.
- Filtrado de sugerencias de alta precisión en producción: configurando τ = 0,90 (`strict`) se alcanza un 96,7% de precisión con 24,4% de cobertura y 15,1% de pulsaciones ahorradas, útil cuando los falsos positivos son costosos.
- Investigación sobre modelos compilados y n-gramas: el repositorio incluye `build_weights.py`, `scripts/benchmark.py` y documentación de fuentes (`data/SOURCES.md`) para reproducir el proceso de compilación y evaluación.
- Demos estáticas y prototipos: el demo vive en GitHub Pages como página estática (`python3 -m http.server 8080 -d web`), sin infraestructura adicional.

## Benchmarks y rendimiento

Resultados medidos con `python scripts/benchmark.py` sobre el archivo cuantizado publicado, con 1.000 prompts de WildChat y 711 de OASST, MBPP y CoNaLa reservados (el modelo se compila sin el 10% de los prompts):

| Umbral τ (primera palabra) | Precision | Coverage | Keystrokes saved | Solo WildChat (precision / saved) |
|---|---|---|---|---|
| 0,62 (por defecto) | 90,8% | 39,2% | 23,0% | 90,0% / 22,2% |
| 0,80 | 94,9% | 30,5% | 18,3% | 94,5% / 17,8% |
| 0,90 (`strict`) | 96,7% | 24,4% | 15,1% | 96,4% / 14,7% |
| 0,95 | 97,4% | 19,0% | 12,1% | 97,1% / 11,9% |

Comparación con la compilación anterior (Kneser-Ney, extensión con probabilidad combinada ≥ 0,71): 90,2% de precisión y 22,2% de pulsaciones ahorradas. La build actual mejora ambos valores (90,8% y 23,0%). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante `transformers` en float32 ocupa 1,60 GB de pesos; no se indica VRAM adicional para activaciones.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU (PyTorch CPU, 65 ms por siguiente token) y para navegador.
- Cabe en cualquier GPU consumer e incluso en CPU; la variante navegador (10,7 MB uint8) se ejecuta en la pestaña del navegador sin GPU dedicada.
- Opciones de despliegue: `transformers` (`pipeline`), runtime TypeScript propio sin dependencias (`web/autocomplete.ts`), Bun/Node, Web Worker; el tag `text-generation-inference` y `endpoints_compatible` aparece en los metadatos de Hugging Face.
- Latencia y throughput: variante navegador con 2,5 ms de mediana y 4,3 ms p95 por pulsación; variante `transformers` con 65 ms por siguiente token en CPU PyTorch. No se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tmickleydoyle/tiny-autocomplete` | 399.916.440 (97% ceros) | 12.607 contextos n-grama (variante transformers) | Autocompletado compilado, sin entrenamiento | MIT | Hugging Face + demo navegador |
| `tmickleydoyle/ghost-typer-web` (variante hermana) | no disponible (10,7 MB uint8) | 512.533 contextos, vocabulario 30.893 palabras | Compilación hermana para navegador | MIT | Hugging Face |
| Modelos de autocompletado neuronal convencionales | no disponible | no disponible | Entrenamiento con gradiente | variable | variable |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- No es un modelo de propósito general: no hace razonamiento, código complejo, matemáticas, visión ni tool calling.
- Riesgo de sugerencias incorrectas: con el umbral por defecto la precisión es del 90,8%, por lo que aproximadamente 1 de cada 10 sugerencias mostradas no coincide con lo que el usuario iba a escribir.
- No admite media precisión (float16/bf16): los logits se escalan por 1e-5 para mantener la exactitud de la red, lo que rompe en esos formatos.
- La variante `transformers` y la variante navegador no son la misma compilación: difieren en vocabulario (6.000 frente a 30.893 palabras) y contextos (12.607 frente a 512.533), por lo que los resultados no son directamente trasladables entre ambas.
- El modelo se compila sin el 10% de los prompts; las métricas de precisión y cobertura proceden de ese conjunto reservado y pueden no generalizar a otros dominios de texto.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre idoneidad en producción; conviene validar la precisión en el dominio concreto de la aplicación.
- El repositorio ocupa 3,2 GB pese a que los pesos canónicos son 1,60 GB, lo que implica espacio adicional para artefactos y variantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmickleydoyle/tiny-autocomplete
- Variante navegador: https://huggingface.co/tmickleydoyle/ghost-typer-web
- Repositorio de código: https://github.com/tmickleydoyle/ghost-typer
- Demo en vivo: https://tmickleydoyle.github.io/ghost-typer/
- Fuentes de datos: `data/SOURCES.md` en el repositorio de GitHub
- Script de compilación: `build_weights.py` en el repositorio de GitHub
- Script de evaluación: `scripts/benchmark.py` en el repositorio de GitHub
