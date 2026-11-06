# tmickleydoyle/tiny-autocomplete

## Resumen

tiny-autocomplete es un modelo de lenguaje en formato Llama de 91 millones de parámetros cuyos pesos no han sido entrenados mediante descenso de gradiente, sino compilados de forma determinista a partir de un conjunto de reglas cerradas. Lo desarrolla tmickleydoyle como proyecto experimental y lo publica en Hugging Face con licencia MIT. El modelo implementa de forma exacta, dentro de una arquitectura transformer estándar, un modelo de lenguaje n-grama interpolado Witten-Bell de orden 5 sobre un vocabulario de 1.053 palabras.

La relevancia del proyecto es fundamentalmente didáctica y de ingeniería: demuestra que una red `LlamaForCausalLM` con módulos estándar (sin `trust_remote_code`) puede reproducir con precisión de 1e-3 nats las log-probabilidades de un n-grama clásico, y que el resultado se puede ejecutar tanto con `transformers` como con un runtime en TypeScript sin dependencias. No es un modelo de propósito general ni compite en benchmarks de razonamiento.

El modelo solo conoce unas 1.100 frases comunes del inglés, tiene un contexto efectivo de 4 tokens y 128 posiciones, y actúa como una máquina de búsqueda de siguiente palabra, no como un modelo generativo capaz de razonar. Es útil como referencia educativa, como banco de pruebas de tooling de inferencia y como ejemplo de compilación de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 1 capa) |
| Parámetros totales | 91.038.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 posiciones; 4 tokens de contexto efectivo (n-grama de orden 5) |
| Tipos de cuantización | no disponible (pesos en float32; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors); tokenizer.json; runtime TypeScript propio |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo Llama con una sola capa, dimensión oculta 2088, 3 cabezas de query, 1 cabeza KV, `head_dim` 256, anchura de MLP 13.148, vocabulario de 1.053 tokens, `rope_theta` 2 y precisión float32. El desglose de parámetros es: embeddings y `lm_head` 4.397.328, atención q/k/v/o 4.276.224, MLP gate/up/down 82.359.072 y RMSNorms 6.264.

No hubo entrenamiento: cada peso se genera con una regla de forma cerrada en `build_weights.py` aplicada a unas 1.100 frases en inglés del directorio `phrases/`. El flujo residual se divide en ranuras nombradas (constante 1, código del token actual, códigos de los 3 tokens anteriores y ranura de logits). Las embeddings son vectores unitarios aleatorios con semilla de tamaño 256. Las 3 cabezas de atención usan queries y keys constantes cuyas fases RoPE hacen que cada cabeza mire exactamente 1, 2 o 3 tokens atrás con un margen de al menos 30 nats, copiando el código del token a su ranura. El MLP tiene una neurona por cada contexto de 1 a 4 tokens observado en las frases (13.148 neuronas en total); cada neurona se activa solo si todos los tokens de su contexto coinciden y suma `log p(next | context) − log p(next | shorter context)` a los logits, de modo que las sumas telescopan hasta la log-probabilidad bajo el contexto conocido más largo. RMSNorm cancela las normas residuales fijas y `lm_head` lee la ranura de logits. El resultado es una implementación exacta de un n-grama Witten-Bell interpolado de orden 5.

## Capacidades

- Predicción de siguiente palabra con probabilidades calibradas sobre su vocabulario de 1.053 palabras.
- Autocompletado de frases comunes del inglés (por ejemplo, "Once upon a" → "time.").
- Generación de texto corto limitada a las continuaciones presentes en sus frases fuente.
- Inferencia en `transformers` mediante `pipeline` y `AutoModelForCausalLM`.
- Ejecución sin Python mediante un runtime TypeScript propio (`model.ts`) sobre Bun o Node ≥ 23.6, con CLI (`autocomplete.ts`) y UI web (`ui.ts`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Demostración educativa de equivalencia entre transformer y n-grama: permite mostrar en un curso o artículo cómo una red Llama estándar puede codificar exactamente un modelo de lenguaje estadístico clásico, verificable con `test_model.py`.
- Banco de pruebas de tooling de inferencia: al ser un modelo de 91M en formato Llama con módulos estándar, sirve para validar pipelines de carga, tokenización y generación en `transformers` sin coste de cómputo.
- Autocompletado de interfaz en prototipos: la UI web incluida muestra ghost text y sugerencias con probabilidades, útil para experimentar con patrones de UX de autocompletado antes de integrar un modelo real.
- Referencia para compilar pesos propios: `build_weights.py` y `docs/how-it-works.md` documentan cómo regenerar el modelo con un listado de frases propio, lo que sirve como plantilla para experimentos de pesos deterministas.
- Pruebas de paridad entre lenguajes: el runtime TypeScript y el modelo en `transformers` permiten comparar salidas entre Python y TypeScript/Node en entornos de CI.
- Ejemplo mínimo de despliegue compatible con text-generation-inference y endpoints: sus tags indican compatibilidad con TGI y endpoints, útil para probar infraestructura de serving con un modelo de 0,4 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una métrica de fidelidad: las log-probabilidades del modelo coinciden con el n-grama de referencia dentro de 1e-3 nats.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 91M de parámetros ocupan aproximadamente 0,36 GB, más overhead de activaciones y tokenizer; el repo completo pesa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) y también puede ejecutarse en CPU.
- Opciones de despliegue: `transformers` (probado con 4.52.4 y 5.22.1), text-generation-inference según los tags, y runtime TypeScript propio sobre Bun 1.3 o Node 24.
- Latencia y throughput estimados: no disponibles; por el tamaño y la arquitectura de una sola capa se espera latencia muy baja, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-autocomplete | 91M | 128 posiciones (4 tokens efectivos) | Transformer compilado que emula un n-grama Witten-Bell | MIT | Hugging Face, runtime TypeScript |
| Modelos n-grama clásicos (KenLM, SRILM) | no aplica | configurable | Modelo estadístico puro | variable | herramientas estándar de NLP |
| Modelos causales pequeños entrenados (por ejemplo, GPT-2 small, 124M) | 124M | 1024 | Transformer entrenado con descenso de gradiente | variable | Hugging Face |

La comparación con modelos neuronales pequeños no es directa: tiny-autocomplete no generaliza y solo reproduce sus frases fuente, mientras que un modelo entrenado de tamaño similar aprende representaciones generales. Frente a un n-grama clásico, la diferencia es de empaquetado: misma semántica estadística, pero dentro de un grafo transformer ejecutable con herramientas de ML modernas.

## Limitaciones y advertencias

- Solo conoce sus ~1.100 frases fuente: 1.053 palabras, como máximo 4 tokens de contexto y 128 posiciones.
- Las palabras desconocidas se convierten en `<unk>` y el modelo retrocede a contextos más cortos.
- Es una máquina de búsqueda, no un modelo de razonamiento: sobre texto nuevo predice palabras siguientes comunes, no continuaciones significativas.
- El prompt se trata siempre como inicio de frase.
- El tokenizer pasa la entrada a minúsculas, por lo que la salida es en minúsculas, y antepone un token BOS automáticamente.
- La lista de frases fue escrita por un asistente de programación (Claude) para este proyecto; no se extrajo de ningún corpus, lo que limita su cobertura y representatividad.
- Riesgo de alucinación en el sentido de continuaciones plausibles pero sin relación semántica con la entrada; no debe usarse en producción para generación de texto real.
- Sesgos: el vocabulario y las frases reflejan el inglés común elegido por el autor, sin control de sesgos demográficos o culturales.
- Licencia MIT: permite uso comercial, pero el modelo carece de utilidad práctica para tareas comerciales de generación.

## Enlaces

- Hugging Face: https://huggingface.co/tmickleydoyle/tiny-autocomplete
- Documentación de construcción: docs/how-it-works.md (incluido en el repositorio)
- Compilador de pesos: build_weights.py (incluido en el repositorio)
- Suite de verificación: test_model.py (incluido en el repositorio)
- Runtime TypeScript, CLI y UI: model.ts, autocomplete.ts, ui.ts, ui.html (incluidos en el repositorio)
- Frases fuente: phrases/*.txt (incluidas en el repositorio)
- Bun: https://bun.sh
