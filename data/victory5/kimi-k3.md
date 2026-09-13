# victory5/Kimi-K3

## Resumen

Kimi K3 es un modelo multimodal nativo de tipo agente, publicado con pesos abiertos por Moonshot AI. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parametros totales y 104.000 millones de parametros activos por token, construido sobre dos innovaciones de atencion: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes). Incorpora vision nativa (texto, imagen y video en el mismo modelo) y una ventana de contexto de 1.000.000 de tokens. Segun su model card, es el primer modelo abierto de la clase de 3 billones de parametros.

El modelo se orienta a dos ejes: codigo de horizonte largo (sesiones de ingenieria extensas, navegacion de repositorios grandes, orquestacion de herramientas de terminal, optimizacion de kernels de GPU, desarrollo de compiladores, CAD o diseno de chips) y trabajo de conocimiento agentico de extremo a extremo (investigacion profunda con visualizaciones interactivas, dashboards, diseno de movimiento y edicion de video). Frente a Kimi K2, la model card declara una mejora aproximada de 2,5 veces en eficiencia de escalado, atribuida al aumento de dispersidad del MoE mediante el framework Stable LatentMoE (16 expertos activados de 896).

La ficha que se documenta aqui corresponde al repositorio `victory5/Kimi-K3` en HuggingFace, una publicacion de terceros (autor `victory5`, 0 descargas y 0 likes en el momento de la consulta) que replica la model card oficial de Moonshot AI. El repositorio tiene un tamano declarado de 1.561 GB y su creacion esta registrada el 12 de septiembre de 2026. Es relevante ahora porque situa pesos de clase frontera en abierto bajo la licencia Kimi K3, aunque con requisitos de hardware fuera del alcance de cualquier estacion de trabajo individual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida: 69 capas KDA (Kimi Delta Attention) + 24 capas Gated MLA, 93 capas totales (1 densa) |
| Parametros totales | 2.779.931.837.184 (2,8 T) segun safetensors |
| Parametros activos | 104.000 millones (16 de 896 expertos por token) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | 8 bits; el repositorio incluye el tag `compressed-tensors`. No se detallan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (`license: other`, `license_name: "kimi-k3"`). Consultar el archivo LICENSE del repositorio |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) y soporte de `compressed-tensors` |

Datos adicionales de arquitectura declarados en la model card: dimension oculta de atencion 7.168, 96 cabezas de atencion, dimension del Latent MoE 3.584, dimension oculta por experto 3.072. El campo del numero de expertos seleccionados por token aparece truncado en la informacion disponible; el apartado de caracteristicas indica 16 de 896.

## Arquitectura y entrenamiento

Kimi K3 abandona el transformer denso convencional en dos frentes. Primero, sustituye la mayor parte de las capas de atencion por Kimi Delta Attention (KDA): 69 de las 93 capas usan esta atencion, mientras que las 24 restantes emplean Gated MLA. Esta combinacion es caracteristica de las arquitecturas hibridas que persiguen reducir el coste del cache KV en contextos muy largos, algo critico cuando la ventana anunciada es de un millon de tokens. Segundo, incorpora Attention Residuals (AttnRes) como mecanismo de residuales, y escala la dispersidad del MoE con Stable LatentMoE, que activa 16 expertos de 896 por token. La model card cifra en aproximadamente 2,5 veces la mejora de eficiencia de escalado global respecto a Kimi K2.

El modelo es multimodal nativo: procesa texto, imagenes y video dentro de la misma red, sin adaptadores externos descritos en la informacion disponible. Los tags del repositorio confirman el pipeline `image-text-to-text` y la presencia de un modo conversacional. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o aprendizaje por refuerzo con verificadores; la model card tampoco detalla hiperparametros de entrenamiento ni la estrategia de alineacion.

## Capacidades

- Generacion de texto y razonamiento de horizonte largo, con sesiones sostenidas de trabajo sin supervision humana intensiva.
- Comprension multimodal nativa de imagenes y video, integrada en el mismo modelo que el texto.
- Codigo: navegacion de repositorios grandes, refactorizacion, optimizacion de kernels de GPU, desarrollo de compiladores, vision-in-the-loop para desarrollo de videojuegos, CAD y diseno de chips.
- Orquestacion de herramientas de terminal y uso de herramientas externas a lo largo de multiples pasos.
- Comportamiento agentico de multiples pasos con contexto de un millon de tokens, adecuado para tareas que requieren mantener grandes volumenes de informacion en memoria.
- Trabajo de conocimiento de extremo a extremo: investigacion profunda, generacion de visualizaciones interactivas, widgets, dashboards, diseno de movimiento y edicion de video.
- No se detalla en la informacion disponible el soporte explicito de function calling mediante un esquema JSON declarado, ni la lista de idiomas soportados.

## Casos de uso

- Ingenieria de software en repositorios grandes: con 1.000.000 de tokens de contexto, el modelo puede cargar simultaneamente multiples modulos, tests y documentacion de un monorepo y razonar sobre dependencias cruzadas sin trocear el codigo en fragmentos desconectados.
- Agentes autonomos de terminal: su capacidad de orquestar herramientas de linea de comandos permite construir agentes que ejecutan builds, interpretan errores y aplican parches de forma iterativa con supervision minima.
- Optimizacion de kernels y codigo de bajo nivel: la model card cita explicitamente la optimizacion de kernels de GPU y el desarrollo de compiladores como escenarios objetivo, lo que lo hace adecuado para equipos de infraestructura de ML.
- Investigacion profunda automatizada: generacion de informes con visualizaciones interactivas y dashboards a partir de fuentes heterogeneas, aprovechando la ventana de contexto para mantener todo el material de referencia.
- Analisis de video y contenido visual: al ser multimodal nativo, puede indexar, resumir y anotar flujos de video o lotes de imagenes en la misma pasada que el texto asociado.
- Edicion de video y diseno de movimiento asistidos: la model card menciona estas capacidades como parte del trabajo de conocimiento agentico, lo que habilita asistentes que proponen y aplican cortes, transiciones o animaciones.
- Diseno asistido por ordenador (CAD) y diseno de chips: casos citados por el autor, utiles en flujos donde el modelo actua como copiloto sobre representaciones estructuradas y restricciones fisicas.
- Evaluacion comparativa interna de modelos frontera: como pesos abiertos, permite a equipos de investigacion reproducir y auditar resultados sobre una arquitectura MoE hibrida de ultima generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye el tag `eval-results`, pero no se ha proporcionado ninguna tabla con valores de MMLU, HumanEval, GSM8K, SWE-bench ni metricas multimodales, por lo que no se presentan cifras.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo a partir del numero de parametros declarado, sin contar cache KV ni activaciones):
  - BF16/FP16: aproximadamente 5,6 TB.
  - FP8/INT8: aproximadamente 2,8 TB.
  - INT4: aproximadamente 1,4 TB.
- El repositorio declara un tamano de 1.561 GB, un valor intermedio entre los escenarios de 8 bits y 4 bits; conviene verificar la configuracion de cuantizacion real antes de planificar el despliegue.
- El coste de cache KV es dificil de estimar con los datos disponibles: 69 de las 93 capas usan KDA, lo que previsiblemente reduce el crecimiento del cache frente a atencion completa, pero no se publica el detalle necesario para calcularlo.
- GPU recomendadas: para BF16 se necesita agregacion multi-nodo (por ejemplo, varios nodos con 8xH100 80 GB o 8xH200 141 GB, insuficientes por si solos); para INT8 el minimo practico esta en el entorno de 4-6 nodos de 8xH100; para INT4 serian necesarias del orden de 16-24 H100 80 GB, o 8xB200 de 192 GB.
- No cabe en GPU de consumo: ninguna RTX 4090, RTX 5090 o similar puede alojar los pesos, y el modelo no esta pensado para ejecucion local en una sola maquina.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repositorio usa `custom_code`), y previsiblemente servidores de inferencia con soporte de MoE de gran escala como vLLM o SGLang, siempre que soporten la arquitectura KDA y Gated MLA. No se confirma soporte de llama.cpp, Ollama, TGI ni formato GGUF en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8 T | 104.000 M | 1.000.000 tokens | Kimi K3 License | Pesos abiertos en HuggingFace |
| Kimi K2 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Referenciado en la model card como predecesor; Kimi K3 declara unas 2,5x mas eficiencia de escalado |
| Otros modelos MoE de clase frontera (DeepSeek, Qwen, Llama) | no disponible | no disponible | no disponible | no disponible | No se aportan datos verificables en la informacion disponible |

No se dispone de cifras verificables de rendimiento ni de especificaciones de modelos alternativos dentro de la informacion proporcionada, por lo que la comparativa se limita al predecesor citado por el propio autor.

## Limitaciones y advertencias

- Repositorio de terceros: la publicacion analizada esta subida por el usuario `victory5`, no por la organizacion oficial `moonshotai`. No hay garantia de que los pesos sean identicos a los originales, ni de que no hayan sido modificados.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Licencia: se trata de una licencia `other` con nombre "kimi-k3". Las condiciones exactas de uso comercial, redistribucion y atribucion no se detallan en la informacion proporcionada; es obligatorio revisar el archivo LICENSE antes de cualquier uso en produccion.
- Idiomas soportados: no disponibles. No se puede asumir un rendimiento homogeneo en castellano ni en otras lenguas distintas del ingles y el chino sin evaluacion propia.
- Riesgo de alucinacion: no se publican tasas de fidelidad ni evaluaciones de veracidad; en tareas de investigacion y generacion de codigo de horizonte largo la propagacion de errores en cadenas de muchos pasos es un riesgo real.
- Coste de despliegue extremo: con 2,8 T de parametros, el modelo no es viable en infraestructura de un solo nodo; cualquier uso en produccion implica inversion en clústeres multi-GPU con el consiguiente coste energetico y de latencia.
- Compatibilidad de tooling: el tag `custom_code` obliga a ejecutar codigo remoto y reduce la compatibilidad con ecosistemas de inferencia estandar; conviene verificar el soporte efectivo en vLLM/SGLang antes de comprometerse.
- Ausencia de datos de entrenamiento: no se especifican tokens de entrenamiento, composicion del dataset ni proceso de alineacion, lo que dificulta la auditoria de sesgos y de contaminacion de benchmarks.
- Rendimiento de contexto largo: aunque se anuncia una ventana de 1.000.000 de tokens, no se aportan resultados de pruebas tipo "needle in a haystack" que confirmen la recuperacion efectiva de informacion en todo el rango.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/victory5/Kimi-K3
- Organizacion oficial en HuggingFace: https://huggingface.co/moonshotai
- Repositorio oficial del modelo en HuggingFace: https://huggingface.co/moonshotai/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat oficial: https://www.kimi.com
- Pagina de Moonshot AI: https://www.moonshot.ai
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
