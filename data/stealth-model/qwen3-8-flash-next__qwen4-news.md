# stealth-model/Qwen3.8-Flash-Next__Qwen4-news

## Resumen

Qwen3.8-Flash-Next__Qwen4-news es una cuantización GGUF del modelo Qwen3.8-Flash-Next, publicada por stealth-model en Hugging Face. El modelo base, Qwen3.8-Flash-Next, es la vista previa oficial de la arquitectura que Alibaba/Qwen empleará en la próxima generación Qwen 4, por lo que esta ficha permite evaluar y ejecutar sobre hardware propio el diseño que la serie definitiva utilizará. El repositorio se presenta como punto de descarga tanto de esta preview como de los futuros GGUF de Qwen 4.

Técnicamente, se trata de un modelo de mezcla de expertos (MoE) con 512 expertos, de los cuales 10 se activan por token, y una innovación destacable: una memoria de n-gramas aprendida que acompaña a la atención dispersa (sparse attention). Ofrece una ventana de contexto nativa de 262.144 tokens, ampliable hasta 1 millón mediante YaRN, e incluye soporte de visión mediante proyectores multimodales (mmproj) y una capa de predicción multi-token (MTP) para acelerar la generación. Los pesos totales del modelo base ascienden a 176.943.899.520 parámetros, aunque gracias al esquema de offloading de expertos a RAM y SSD, solo se necesitan entre 4 y 5,5 GB de VRAM en GPU para ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (512 expertos, 10 activos por token) con sparse attention y memoria de n-gramas aprendida |
| Parametros totales | 176.943.899.520 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.000.000 con YaRN |
| Tipos de cuantizacion | Q2_K_XL, Q4_K_XL, Q5_K_XL (imatrix); mmproj en Q4_K, Q6_K, Q8_0 y F16; MTP en Q8_0 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (tipo "other") |
| Formato de pesos | GGUF (compatible con llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next emplea la nueva arquitectura de Qwen para la serie Qwen 4: un transformer disperso con una tabla de memoria de n-gramas aprendida junto a la atención dispersa (sparse attention). La capa de expertos consta de 512 expertos con 10 activos por token, distribuidos en 48 capas de expertos, lo que permite un offloading agresivo: los expertos residen en RAM del sistema y la tabla de n-gramas (29 GB en Q2/Q4, 54 GB en Q5) puede permanecer en SSD mediante modo perezoso (lazy mode).

El modelo incluye una capa de predicción multi-token (MTP) entrenada por Qwen, que funciona como draft head para decodificación especulativa: según mediciones de Unsloth, proporciona aceleraciones de entre 1,3x y 1,7x en la velocidad de salida. Adicionalmente, el flag `--spec-type ngram-mod` permite redactar tokens a partir del propio contexto sin coste de memoria. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiquetado como conversational).
- Comprension de imagenes (vision) mediante archivos mmproj en cuatro niveles de precision, con perdida casi nula en Q8_0 y un tercio menos de VRAM.
- Contexto ultra-largo: 262k tokens nativos y hasta 1M con escalado YaRN, con cache KV en 4 bits que ocupa solo unos 2 GB a 256k y 8 GB a 1M.
- Decodificacion especulativa mediante MTP (capa propia del modelo) y mediante n-gram-mod sobre el contexto existente.
- Soporte para llama.cpp (build b11971 del 28 de octubre o posterior; MTP requiere la rama `qwen4exp/mtp` de Unsloth).
- No se ha publicado informacion sobre tool calling, agentes ni capacidades de razonamiento especificas.

## Casos de uso

- Analisis de documentos muy extensos: con 262k tokens nativos (y 1M con YaRN), permite procesar contratos, expedientes o bases de codigo completas en una sola peticion, con cache KV comprimida a 4 bits que reduce el coste de memoria a unos 2 GB a 256k.
- Resumen y edicion de codigo en repositorios grandes: la decodificacion especulativa ngram-mod es gratuita en memoria y rinde mejor cuando la respuesta repite el input, escenario tipico de reescrituras y resumenes de codigo.
- Chatbot multimodal local: combinando el GGUF principal con mmproj-Q8_0, se pueden construir asistentes que respondan sobre imagenes sin depender de APIs externas.
- Despliegue en hardware de gama alta de consumo: la variante Q2_K_XL funciona en GPUs de 16 GB con 64 GB de RAM, democratizando el acceso a un modelo de 177B de parametros.
- Ejecucion en ordenadores de memoria unificada: en AMD Strix Halo o NVIDIA DGX Spark con 128 GB unificados, el modelo Q4_K_XL se carga integramente en la GPU sin offloading, simplificando el despliegue.
- Generacion por lotes con alto throughput: la capa MTP acelera la salida entre 1,3x y 1,7x, util en pipelines de generacion masiva de texto donde la latencia por token importa.
- Evaluacion temprana de la arquitectura Qwen 4: equipos de investigacion pueden estudiar el comportamiento de la memoria de n-gramas y el MoE de 512 expertos antes de la salida oficial de Qwen 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM minima: solo 4 a 5,5 GB del modelo deben residir en GPU; el resto se reparte entre RAM (expertos) y SSD (tabla de n-gramas).
- Configuraciones recomendadas segun el README:
  - 16 GB GPU + 64 GB RAM: Q2_K_XL (79 GB), maximo 512k de contexto.
  - 24 GB GPU + 64 GB RAM: Q2_K_XL; con 96-128 GB de RAM: Q4_K_XL (111 GB).
  - 32 GB GPU + 96-128 GB RAM: Q4_K_XL; con 128 GB RAM y maxima calidad: Q5_K_XL (158 GB).
  - AMD Strix Halo o NVIDIA DGX Spark con 128 GB unificados: Q4_K_XL integramente en GPU.
  - 192 GB o mas de memoria unificada: Q5_K_XL integramente en GPU.
- RAM para expertos: 25-43 GB en Q2_K_XL, 58-73 GB en Q4_K_XL, 80-86 GB en Q5_K_XL, segun contexto (256k/1M).
- Cache KV en 4 bits (`-ctk q4_0 -ctv q4_0`): ~2 GB a 256k, ~8 GB a 1M.
- Tabla de n-gramas: 29 GB (54 GB en Q5) en RAM, o en SSD con `--lazy-mode on` (se recomienda NVMe rapido).
- MTP: 2,8 GB de VRAM adicionales (1,9 GB con Q4_K_M).
- Software: llama.cpp build b11971 (28 de octubre) o posterior; para MTP, la rama `qwen4exp/mtp` de Unsloth (soporte oficial en revision). El despliegue se realiza con `llama-server`; no se menciona soporte para vLLM, TGI u Ollama.
- No se han publicado cifras de latencia ni throughput absolutos (solo la aceleracion relativa de 1,3x-1,7x con MTP).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (este modelo, GGUF) | 176,9 B | MoE, 512 expertos (10 activos), sparse attention + n-gram memory | 262k nativo, 1M con YaRN | qwen-community-1.0 | GGUF publicado |
| Qwen4-27B (anunciado) | 27 B | Denso | no disponible | no disponible | "el dia del lanzamiento", aun no publicado |
| Qwen4-35B-A3B (anunciado) | 35 B (A3B probable) | MoE pequeno (probable) | no disponible | no disponible | "el dia del lanzamiento", aun no publicado |
| Qwen4-Flash (anunciado) | no disponible | gama eficiente Qwen 4 | no disponible | no disponible | "el dia del lanzamiento", aun no publicado |

Los modelos Qwen 4 listados figuran en la propia model card como anuncios pendientes de publicacion, por lo que no existen datos de rendimiento comparables.

## Limitaciones y advertencias

- El modelo base es una "preview" de la arquitectura Qwen 4, no un modelo de produccion final; su comportamiento y calidad pueden cambiar en la version definitiva.
- El numero de parametros activos, los idiomas soportados, los benchmarks y los detalles de entrenamiento no se han publicado, lo que dificulta evaluar su calidad real.
- La ejecucion con offloading depende de un NVMe rapido si la tabla de n-gramas se deja en SSD; con discos lentos la latencia puede degradarse notablemente.
- MTP requiere una rama no oficial de llama.cpp (`qwen4exp/mtp` de Unsloth); el soporte en llama.cpp oficial esta todavia en revision, lo que introduce riesgo de inestabilidad.
- La licencia qwen-community-1.0 es de tipo "other": conviene revisar el texto completo antes de cualquier uso comercial, ya que las licencias comunitarias de Qwen suelen incluir umbrales o condiciones especificas.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- El repositorio tiene 355,7 GB en total; descargar solo las variantes necesarias es imprescindible.
- La configuracion de contexto extendido con YaRN debe usarse solo cuando se necesite la longitud, segun la propia recomendacion de Qwen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stealth-model/Qwen3.8-Flash-Next__Qwen4-news
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/stealth-model/Qwen3.8-Flash-Next__Qwen4-news/blob/main/Qwen3.8-Flash-Next/LICENSE
- Guia de Stealth Models sobre Qwen 4: https://stealthmodels.com/qwen-4/
- Web de Stealth Models: https://stealthmodels.com/
