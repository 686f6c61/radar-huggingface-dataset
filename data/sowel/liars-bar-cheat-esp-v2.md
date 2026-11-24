# sowel/liars-bar-cheat-esp-v2

## Resumen

El artefacto publicado bajo el identificador `sowel/liars-bar-cheat-esp-v2` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits distribuido como supuesto "cheat" o mod menu para el videojuego *Liar's Bar*, empaquetado en un archivo ZIP de 4,8 MB protegido con contraseña y acompañado de un ejecutable (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`). La model card describe módulos de overlay externo, escáner de offsets, radar 2D y suavizado de entrada, todos ellos propios de una herramienta de trampas para videojuegos, no de un sistema de aprendizaje automático.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. Los campos de Hugging Face que normalmente describen un modelo (pipeline, parámetros, contexto, formato de pesos) no están disponibles o sencillamente no aplican. Los únicos metadatos reales son la licencia MIT declarada, una lista de catorce idiomas y una colección de etiquetas centradas en Windows y en el nombre del supuesto cheat.

Por tanto, esta ficha se limita a documentar lo que el artefacto es y a advertir de los riesgos asociados. No existe arquitectura, entrenamiento, capacidades cognitivas ni benchmarks que evaluar. Cualquier uso en un contexto de desarrollo o investigación de IA es inadecuado: el contenido es un binario de terceros de procedencia no verificada que solicita ejecución como administrador y que los propios autores admiten que puede disparar alertas de Windows Defender o SmartScreen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin relación con capacidades lingüísticas reales) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el paquete distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario compilado para Windows x64 que, según la model card, opera mediante "user-mode external core" con renderizado por Desktop Duplication, escaneo dinámico de offsets de memoria y polling a 270 Hz. Estos términos describen técnicas de lectura de memoria de un proceso ajeno y superposición gráfica, habituales en herramientas de trampas, no componentes de un transformer, MoE o SSM.

No hay información sobre datos de entrenamiento, tokens procesados, composición del dataset, RLHF, DPO ni ninguna innovación en el ámbito del aprendizaje automático. La model card incluye instrucciones de instalación (descarga del ZIP, contraseña `2026`, ejecución como administrador) y una FAQ que justifica las alertas de antivirus, lo que constituye una señal de riesgo más que una descripción técnica legítima.

## Capacidades

- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales pese a la lista de idiomas en los metadatos.
- No incluye modo thinking, visión, audio ni ninguna capacidad cognitiva.
- Lo que el binario declara hacer, según su propia model card, es superponer cajas 2D/3D, esqueletos y distancias sobre el juego *Liar's Bar*, filtrar objetos por rareza y suavizar entradas de puntero con curvas de Bézier.

## Casos de uso

- Ninguno legítimo en el ámbito de la IA, el desarrollo de software o la investigación. El artefacto no procesa lenguaje ni datos.
- Auditoría de seguridad defensiva: un analista podría inspeccionar el binario en un entorno aislado para caracterizar la amenaza, pero esto exige sandboxing estricto y no debe hacerse en máquinas de producción.
- Estudio de campañas de distribución de malware: el patrón (ZIP con contraseña, ejecutable que pide administrador, justificación de alertas de antivirus) es un caso de manual que puede servir para formar a equipos de seguridad.
- Documentación de riesgos en plataformas de modelos: sirve como ejemplo de contenido que no debería alojarse en un repositorio de modelos y de por qué conviene moderar este tipo de publicaciones.
- No se recomienda ningún uso recreativo ni de modding: ejecutar el binario implica otorgar privilegios de administrador a código de procedencia desconocida.
- No se debe integrar en pipelines de CI/CD, servicios en la nube ni entornos de desarrollo, ya que no aporta funcionalidad de IA y expone la infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de marketing (por ejemplo, "99,2 % de consistencia" o "respuesta en menos de 24 ms") que no son verificables y no constituyen evaluaciones reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos reales declarados: Windows 10 u 11 de 64 bits, privilegios de administrador y 4,8 MB de espacio para el ZIP.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son fiables.

## Comparativa con modelos similares

| Artefacto | Naturaleza | Parametros | Contexto | Licencia | Riesgo |
|---|---|---|---|---|---|
| `sowel/liars-bar-cheat-esp-v2` | Ejecutable Win64 (cheat) | no aplica | no aplica | MIT declarada | Alto: binario de terceros, pide admin, alertas de AV |
| Modelo de lenguaje open source (p. ej. Llama, Mistral, Qwen) | Pesos de red neuronal | Miles de millones | Miles de tokens | Permisiva o comunitaria | Bajo o medio, auditable |
| Modelo de visión open source (p. ej. YOLO, SAM) | Pesos de red neuronal | Millones | no aplica | Variable | Bajo, auditable |

No existe comparación técnica posible con modelos de IA porque el artefacto no pertenece a esa categoría. La comparativa anterior solo ilustra la diferencia de naturaleza y de perfil de riesgo.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede evaluarse con métricas de ML.
- Procedencia no verificada: el binario se distribuye desde un repositorio de GitHub de terceros y no hay firma ni cadena de custodia.
- Solicita ejecución como administrador y justifica explícitamente las alertas de Windows Defender y SmartScreen, lo que es una señal clásica de software potencialmente malicioso.
- El ZIP está protegido con contraseña (`2026`), técnica habitual para evadir el análisis automático de antivirus.
- Riesgo legal: el uso de cheats en videojuegos puede violar los términos de servicio del juego y, en algunas jurisdicciones, la legislación sobre acceso no autorizado a sistemas.
- Riesgo de seguridad: ejecutar el binario puede comprometer credenciales, instalar persistencia o exponer la máquina a código arbitrario.
- La licencia MIT declarada no aporta garantías sobre el contenido ni sobre su legalidad; una licencia de software no legitima una herramienta de trampas.
- Los metadatos de idioma no reflejan capacidades reales y no deben interpretarse como soporte multilingüe.
- No debe alojarse ni redistribuirse en entornos corporativos o académicos sin un análisis de seguridad previo.

## Enlaces

- Hugging Face: https://huggingface.co/sowel/liars-bar-cheat-esp-v2
- Repositorio de releases citado en la model card: https://github.com/omarjimenez44262/liars-bar-cheat-esp-v2/releases/latest
- Paquete de descarga citado en la model card: https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Resultados de búsqueda web: sin relación con el artefacto (corresponden a la cadena hotelera francesa Sowell y a la aplicación SoWell, ajenos a este repositorio).
