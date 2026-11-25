# walissoncasonatto/gemma-4-e4b-netops

## Resumen

Gemma 4 E4B NetOps es un ajuste fino (fine-tune) del modelo google/gemma-4-E4B-it especializado en tareas de troubleshooting de redes FRRouting (FRR 10.4), concretamente en la resolución de fallos de OSPF y BGP. Lo desarrolla walissoncasonatto y se distribuye como un agente de tool calling que lee el estado de la red mediante herramientas de solo lectura y, a partir de la evidencia recogida, propone una corrección mínima con líneas de rollback, informa de que la red está sana o escala el caso. El modelo nunca aplica cambios por sí mismo: cada propuesta pasa por un paso de aprobación humana en el arnés (harness) de ejecución.

El modelo parte de la arquitectura de la familia Gemma 4 en su variante E4B-it, con 7.941.100.874 parámetros totales según los pesos en safetensors, y se ha entrenado mediante LoRA (r=32, alpha=32) sobre las proyecciones de atención y MLP del modelo base, con fusión posterior a BF16. El repositorio incluye tanto el modelo fusionado como el adaptador LoRA y dos builds GGUF (Q8_0 y Q5_K_M). Está pensado para entornos de laboratorio y despliegues controlados donde se requiera automatizar el diagnóstico de incidencias de enrutamiento con supervisión humana.

Es relevante ahora porque aborda un nicho poco cubierto por los modelos generalistas: el razonamiento agéntico sobre topologías de red reales con herramientas específicas de FRR, y porque publica una evaluación rigurosa con lockbox, intervalos de confianza por bootstrap pareado y una declaración explícita de carencias. Su licencia Apache-2.0 facilita la integración en productos comerciales, aunque con las advertencias que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B-it) con adaptador LoRA fusionado |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (modelo fusionado), GGUF Q8_0 y Q5_K_M |
| Idiomas soportados | en, pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre google/gemma-4-E4B-it, un transformer de la familia Gemma 4 en su variante instruct. Sobre él se aplica un adaptador LoRA con r=32, alpha=32 y sin dropout, únicamente en las proyecciones de atención y MLP del modelo de lenguaje, con learning rate 1e-4, 2 épocas y cálculo de pérdida solo en los turnos del asistente. Tras el entrenamiento, el adaptador se fusiona en un checkpoint BF16 que es el que se publica como model.safetensors, además de conservarse el adaptador en la carpeta lora/ y dos builds GGUF para llama.cpp.

El entrenamiento se realizó con destilación desde un profesor (DeepSeek V4.1 Flash, vía Ollama Cloud) que ejecutaba el mismo bucle agéntico sobre 8 topologías de entrenamiento; solo se conservaron trayectorias verificadas: fallo corregido, matriz de ping en verde, sin diferencias colaterales y sin líneas destructivas. El dataset final tiene 1.314 filas: 874 episodios de fallo, 200 episodios de red sana (auditorías profundas que terminan en report_no_fault en 11 pasos o menos) y 240 filas generales para limitar el olvido catastrófico (120 de UltraChat 200k y 120 de ToolACE). Se realizaron 7 rondas de entrenamiento, una variable por ronda, todas evaluadas contra el modelo base; las rondas 6 (éxitos on-policy) y 7 (enseñar escalate en routers gestionados por el cliente) no superaron a la ronda 5, que es la versión publicada. Como medidas anti-sobreajuste, las topologías de evaluación, las familias de fallos reservadas y las semillas del lockbox nunca se entrenaron, y los splits se hacen por escenario con nombres de nodo, ASN y direcciones aleatorizados por escenario.

## Capacidades

- Generación de texto conversacional en inglés y portugués, con soporte de razonamiento multi-paso orientado a diagnóstico.
- Tool calling con un conjunto fijo de herramientas de solo lectura: show_interfaces, show_ip_route, show_ospf_neighbors, show_ospf_interface, show_bgp_summary, show_bgp_neighbor, get_config, ping, traceroute y search_docs.
- Herramientas de decisión: propose_fix (propuesta de corrección mínima con líneas de rollback), report_no_fault (red sana) y escalate (evidencia insuficiente o causa fuera de la red).
- Comportamiento agéntico con bucle de hasta 16 pasos por episodio, con recogida de evidencia antes de proponer cambios y comparación de ambos extremos de una adyacencia o sesión rota.
- Diagnóstico específico de OSPF (adyacencias, interfaces) y BGP (resumen y vecinos) en FRRouting 10.4.
- Capacidad de auditoría profunda de redes sanas que finaliza con report_no_fault dentro del presupuesto de pasos.
- No aplica cambios directamente: toda propuesta requiere aprobación externa en el arnés.
- Soporte de búsqueda documental mediante search_docs para fundamentar decisiones.

## Casos de uso

- Diagnóstico asistido de incidencias OSPF en laboratorios: el agente recibe un ticket, consulta show_ospf_neighbors y show_ospf_interface en ambos extremos de la adyacencia, identifica la causa y propone una corrección mínima con rollback para que un ingeniero la apruebe.
- Resolución de sesiones BGP caídas en entornos de pruebas: con show_bgp_summary y show_bgp_neighbor, el modelo compara el estado de ambos peers, detecta asimetrías de configuración o alcanzabilidad y sugiere el cambio puntual.
- Automatización de guardias de red (NOC) con supervisión humana: el agente triagea tickets de red, recoge evidencia con herramientas de solo lectura y escala los casos que no puede resolver, reduciendo el tiempo de primera respuesta.
- Validación de redes sanas antes de un cambio planificado: el modelo ejecuta auditorías profundas y emite report_no_fault cuando no encuentra anomalías, sirviendo como verificación previa en pipelines de cambio.
- Formación de ingenieros de red: las trayectorias propuestas (evidencia, diagnóstico, corrección con rollback) sirven como material didáctico para practicar troubleshooting de FRR en containerlab.
- Integración en pipelines de CI/CD de infraestructura: el agente puede ejecutarse contra topologías efímeras de containerlab para verificar que un cambio de configuración no rompe adyacencias OSPF ni sesiones BGP, con aprobación automática o humana según la política.
- Asistente de documentación operativa: combinando search_docs con las herramientas de lectura, el modelo puede responder consultas sobre el estado de la red y enlazar la evidencia con la documentación interna.

## Benchmarks y rendimiento

Los resultados publicados corresponden a episodios agénticos sobre topologías FRR de containerlab no vistas en entrenamiento. Un episodio se considera éxito solo si el verificador confirma red restaurada, sin cambio colateral, sin llamada malformada y con el final correcto. Temperatura 0,3, máximo 16 pasos. Intervalos del 95 % por bootstrap pareado.

Lockbox (semillas 251/252, abiertas una vez tras elegir el modelo final, una ejecución por modelo):

| Métrica (lockbox) | Base | Fine-tuned |
|---|---|---|
| Éxito de episodio (75 escenarios) | 48,0 % | 65,3 % (ganancia +17,3 pts, IC [+2,7, +32,0]) |
| Episodios de fallo corregidos | 39,0 % | 66,1 % |
| Redes sanas gestionadas correctamente | 81,2 % | 62,5 % |
| Episodios con cambio colateral | 16,0 % | 2,7 % |
| Líneas destructivas | 1 episodio | 0 |
| Tipos de fallo reservados (32 escenarios) | 3,1 % | 25,0 % (ganancia +21,9 pts, IC [+9,4, +37,5]) |
| Episodios reservados con línea destructiva | 0 | 2 |

Conjunto de desarrollo (semilla 201, 75 escenarios, 3 ejecuciones del fine-tune agrupadas; el modelo se eligió sobre este conjunto):

| Métrica | Base | Fine-tuned |
|---|---|---|
| Éxito de episodio | 50,7 % | 71,6 % (ganancia +20,9 pts, IC [+9,3, +32,0]) |
| Episodios de fallo corregidos | 47,7 % | 71,8 % |
| Redes sanas gestionadas correctamente | 70,0 % | 70,0 % |
| Episodios con cambio colateral | 9,3 % | 1,3 % |
| Tipos de fallo reservados (semilla 202) | 6,2 % | 33,3 % (ganancia +27,1 pts, IC [+9,4, +43,8]) |
| MMLU-Pro (100 preguntas) | 31 % | 39 % |
| ToolACE exact call (60) | 55,0 % | 56,7 % |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para los pesos (7,94 mil millones de parámetros a 2 bytes), más overhead de contexto y activaciones; en la práctica se recomienda una GPU de 24 GB o más para trabajar con comodidad.
- VRAM estimada en GGUF Q8_0: en torno a 8-9 GB para los pesos; en Q5_K_M, en torno a 5-6 GB para los pesos.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues en BF16 con vLLM y concurrencia; RTX 4090 (24 GB) para BF16 en una sola GPU; RTX 3090/4080 (16-24 GB) para cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, en RTX 4090 con BF16 y en GPUs de 8-16 GB con las builds GGUF Q8_0 o Q5_K_M mediante llama.cpp.
- Opciones de despliegue: transformers (modelo fusionado), vLLM (modelo fusionado en BF16), llama.cpp y derivados (Ollama, LM Studio) con los GGUF publicados; el adaptador LoRA puede cargarse sobre el modelo base en transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B NetOps (este) | 7.941.100.874 | no disponible | Troubleshooting OSPF/BGP en FRR con tool calling | apache-2.0 | Hugging Face (safetensors, LoRA, GGUF) |
| google/gemma-4-E4B-it (base) | no disponible en la información | no disponible | Modelo generalista instruct | licencia de Gemma (no indicada en la información) | Hugging Face |
| Modelos generalistas de tool calling de tamaño similar | no disponible | no disponible | Tool calling genérico | variable | Hugging Face |

La comparación directa con alternativas especializadas en operaciones de red no está disponible en la información proporcionada. El propio autor publica la comparación frente al modelo base, que es la referencia más fiable: el fine-tune mejora el éxito de episodio en +20,9 pts en desarrollo y +17,3 pts en lockbox, y reduce los cambios colaterales del 9,3 % al 1,3 % en desarrollo y del 16,0 % al 2,7 % en lockbox.

## Limitaciones y advertencias

- El modelo no alcanza el umbral de "usable" declarado por el propio proyecto: redes sanas ≥ 80 % y cero líneas destructivas. En desarrollo las redes sanas quedan en 70 % (igual que el base) y en lockbox en 62,5 % (base 81,2 %); todos los fallos son el agente aún auditando al agotar los 16 pasos, no cambios incorrectos.
- Se registró 1 episodio de 225 en desarrollo que propuso una línea destructiva (eliminar y volver a añadir un vecino BGP), y 3 de 96 episodios en tipos de fallo reservados propusieron líneas destructivas. El paso de aprobación humana es imprescindible.
- El modelo espera un arnés concreto: lista de herramientas estilo OpenAI con los nombres exactos y un system prompt específico. Fuera de ese arnés el rendimiento no está garantizado.
- Idiomas limitados a inglés y portugués; no se declara soporte de castellano.
- El modelo está entrenado para FRRouting 10.4 y topologías de laboratorio; su generalización a otras versiones, fabricantes o redes de producción no está evaluada.
- Los builds GGUF no están puntuados en la evaluación; los resultados publicados corresponden al modelo fusionado en BF16.
- Riesgo de alucinación en la interpretación de evidencia y en la propuesta de correcciones, mitigado parcialmente por el bucle de recogida de evidencia y la verificación externa.
- Sesgos conocidos: no se documentan sesgos específicos más allá de los heredados del modelo base y de los datasets de destilación (UltraChat 200k, generado por ChatGPT, y ToolACE, cuyo modelo generador no se nombra).
- Licencia Apache-2.0 permite uso comercial, pero la licencia del modelo base Gemma 4 E4B-it debe verificarse por separado, ya que la información disponible no detalla sus términos.
- La fecha de creación del repositorio (2026-11-23) y el reducido número de descargas (132) sugieren un proyecto reciente y con poca validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/walissoncasonatto/gemma-4-e4b-netops
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- FRRouting (FRR): no disponible en la información proporcionada
- containerlab: no disponible en la información proporcionada
