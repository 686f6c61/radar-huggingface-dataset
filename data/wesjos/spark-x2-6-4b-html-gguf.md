# wesjos/Spark-x2.6-4B-HTML-GGUF

## Resumen

Spark-x2.6-4B-HTML-GGUF es la versión cuantizada en formato GGUF del modelo wesjos/Spark-x2.6-4B-HTML, un ajuste fino de 4.112.079.360 parámetros especializado en generar respuestas en HTML estructurado (tarjetas, tablas, métricas y avisos) en lugar de Markdown. Lo publica el usuario wesjos bajo licencia Apache-2.0 y está pensado para ejecutarse con llama.cpp, con la plantilla de chat incrustada en el propio archivo GGUF.

El modelo deriva de la familia Spark-X2.6-4B (referencia a XHToken/Spark-X2.6-4B como base) y emplea una arquitectura denominada `spark2_5` con 36 bloques, de los cuales 9 usan atención completa y 27 usan atención deslizante con ventana de 512. La longitud de contexto declarada en los metadatos del GGUF es de 1.048.576 tokens, una cifra muy alta para un modelo de este tamaño.

Su relevancia actual radica en dos factores: el tamaño compacto (2,42 GiB en Q4_K_M y 4,07 GiB en Q8_0) que permite ejecución local en hardware de consumo, y su orientación a la generación de interfaces visuales directamente en HTML, lo que lo hace útil para prototipado rápido de UI y documentación técnica con formato enriquecido. El modelo es solo texto y declara soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5`: 36 bloques (9 de atención completa + 27 de atención deslizante con ventana 512); embedding de 2560 |
| Parametros totales | 4.112.079.360 (4,1B), 290 tensores |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 1.048.576 tokens (`spark2_5.context_length`) |
| Tipos de cuantizacion | Q4_K_M (2,42 GiB) y Q8_0 (4,07 GiB) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); existe checkpoint bf16 en el repo base wesjos/Spark-x2.6-4B-HTML |

## Arquitectura y entrenamiento

La arquitectura es un transformer con atención híbrida: 36 bloques en los que 9 capas emplean atención completa y 27 emplean atención deslizante con ventana de 512 tokens. La atención usa 16 cabezas de consulta y 4 cabezas KV (GQA), con longitud de clave/valor de 256 y RoPE parcial de 64 en las capas completas y 256 en las deslizantes. El vocabulario es de 131.072 tokens con BPE tipo `gpt2` y pre-tokenizador `spark2_5`. El modelo cuenta con 290 tensores y 4.112.079.360 parámetros en su versión bf16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. El ajuste fino específico está orientado a la generación de HTML con una "gramática" de clases CSS documentada en el repo bf16 y verificada contra su `webui/static/theme.css`. El modelo incorpora un modo de razonamiento (thinking) activado por defecto, con un panel de cadena de pensamiento (`<think>`) que se muestra en la demo. La plantilla de chat está incrustada en el GGUF (5.647 bytes) e incluye un system prompt por defecto: `You are Mario-html. You are a helpful assistant who generates nice visual content.` Las cuantizaciones fueron realizadas con Unsloth.

## Capacidades

- Generación de texto conversacional con respuestas en HTML estructurado (tarjetas, tablas, métricas, avisos y chips de código en línea).
- Razonamiento con cadena de pensamiento (`<think>`) activado por defecto; se puede desactivar con `enable_thinking: false`.
- Control del esfuerzo de razonamiento mediante `reasoning_effort`, con valores aceptados `low` y `high` (la plantilla rechaza `medium` y `xhigh`).
- Generación de contenido visual para UI: la demo muestra una curva de ReLU trazada junto a una tabla de dominio/salida/pendiente y una página de plan de estudio de C++ con listas de características y tarjetas de librerías.
- Soporte de plantilla de chat compatible con endpoints OpenAI a través de `llama-server` (`/v1/chat/completions`).
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Prototipado rápido de interfaces web: el modelo genera HTML con clases CSS predefinidas (tarjetas, tablas, métricas), lo que permite obtener maquetas visuales funcionales a partir de una descripción en lenguaje natural sin escribir CSS a mano.
- Documentación técnica enriquecida: para explicar conceptos como ReLU o planes de aprendizaje, produce páginas con definiciones, tablas de propiedades y avisos destacados, útiles en wikis internas o portales de formación.
- Generación de contenido educativo: la demo de "how to learn C++" muestra cómo construir guías de estudio estructuradas con secciones, listas y referencias a librerías, adecuado para plataformas de e-learning.
- Asistentes locales de bajo consumo: con 2,42 GiB en Q4_K_M puede desplegarse en portátiles o equipos sin GPU dedicada mediante llama.cpp, sirviendo como asistente de generación de contenido visual offline.
- Integración en pipelines de documentación: mediante `llama-server` y su API compatible con OpenAI, puede insertarse en flujos que conviertan especificaciones textuales en fragmentos HTML revisables.
- Experimentación con contexto largo: la ventana declarada de 1.048.576 tokens permite procesar documentos extensos, aunque en la práctica el coste de memoria y la calidad en contextos muy largos deben validarse empíricamente.
- Generación de dashboards estáticos: las tarjetas de métricas y tablas que produce el modelo son adecuadas para informes HTML autónomos sin dependencias de frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento aportados por el autor son de la demo con la WebUI y el cuantizado Q8_0: la generación de la página de ReLU produjo 3.882 tokens en 30,09 segundos, lo que equivale a 129 tokens por segundo, según la captura incluida en la model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3 GiB para Q4_K_M (archivo de 2,42 GiB más overhead de contexto) y 4,2-5 GiB para Q8_0 (archivo de 4,07 GiB). El contexto largo incrementa sustancialmente el consumo por la caché KV.
- GPU recomendadas: cualquier GPU con al menos 6-8 GiB de VRAM para Q4_K_M con contexto moderado; para aprovechar contextos de decenas de miles de tokens se recomienda 16 GiB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (requiere build b10828 o posterior para soporte nativo de `spark2_5`; la versión v0.9.0 lo incluye), `llama-server` con `--jinja`, `llama-cli`, y cualquier frontend compatible con la API OpenAI. No se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 129 tok/s en la demo del autor con Q8_0; el rendimiento variará según hardware y cuantización.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, se puede contrastar con alternativas de tamaño similar en el ecosistema GGUF:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-x2.6-4B-HTML-GGUF | 4,1B | 1.048.576 (declarado) | Apache-2.0 | Especializado en salida HTML; solo en/zh |
| Alternativas de ~4B en GGUF | ~4B | variable | variable | No se dispone de datos comparativos verificados en la información disponible |

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés y chino; el rendimiento en castellano no está validado y probablemente sea inferior.
- La salida es HTML con una gramática de clases específica; fuera de la WebUI del repo bf16, el HTML puede no renderizarse como se espera si no se incluye el CSS correspondiente (`theme.css`).
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens y la latencia; para respuestas directas hay que pasar `enable_thinking: false`.
- La plantilla de chat solo acepta `reasoning_effort` con valores `low` y `high`; valores como `medium` o `xhigh` son rechazados por la propia plantilla.
- El contexto de 1.048.576 tokens está declarado en los metadatos, pero no se aportan evidencias de calidad en contextos extremos; el coste de memoria de la caché KV puede hacerlo inviable en hardware de consumo.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en contenido técnico detallado; conviene revisar las salidas antes de usarlas en producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al ser un ajuste fino con datos no publicados, la caracterización de sesgos es desconocida.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y los datos de ajuste no están documentados en detalle, por lo que conviene verificar la procedencia antes de un despliegue comercial.
- El número de descargas y likes es muy bajo (1 descarga, 0 likes en el momento de la consulta), lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wesjos/Spark-x2.6-4B-HTML-GGUF
- Repositorio bf16 (modelo base del ajuste): https://huggingface.co/wesjos/Spark-x2.6-4B-HTML
- Modelo base de la familia: https://huggingface.co/XHToken/Spark-X2.6-4B
- llama.cpp (requiere build b10828 o posterior): https://github.com/ggml-org/llama.cpp
- Unsloth (herramienta de cuantización): https://huggingface.co/unsloth
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/spark-x2-6-4b.html
